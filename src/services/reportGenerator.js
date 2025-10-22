const puppeteer = require('puppeteer')
const fs = require('fs-extra')
const path = require('path')
const Handlebars = require('handlebars')
const db = require('../config/mysql')
const sharp = require('sharp')

class ReportGenerator {
  /**
   * Genera un reporte PDF para un periodo específico
   * @param {number} periodId - ID del periodo
   * @returns {Promise<string>} - Ruta donde se guardó el reporte
   */
  static async generatePeriodReport(periodId) {
    try {
      console.log(`Iniciando generación de reporte para periodo ${periodId}...`)
      
      // 1. Obtener los datos para el reporte
      const reportData = await this.getPeriodReportData(periodId)
      
      // 2. Generar el PDF
      const reportPath = await this.createPDFWithPuppeteer(reportData)
      
      // 3. Actualizar la ruta en la base de datos
      await db.query('UPDATE periods SET per_report_path = ? WHERE per_id = ?', 
        [reportPath, periodId])
      
      console.log(`Reporte generado exitosamente: ${reportPath}\n`)
      return reportPath
    } catch (error) {
      console.error('Error generando reporte:', error)
      throw new Error(`Error generando reporte: ${error.message}`)
    }
  }

  /**
   * Recopila los datos necesarios para el reporte
   */
  static async getPeriodReportData(periodId) {
    // Obtener información del periodo
    const [period] = await db.query(`
      SELECT per_id, per_name, per_date_start, per_date_end, per_exclusive
      FROM periods WHERE per_id = ?
    `, [periodId])
    
    if (!period) throw new Error('Periodo no encontrado')

    // Mapeo de claves de carrera a nombres completos
    const careerNames = {
      'IS75LI0103': 'LICENCIATURA EN INGENIERÍA MECÁNICA',
      'IS75LI0203': 'LICENCIATURA EN INGENIERÍA ELÉCTRICA',
      'IS75LI0303': 'LICENCIATURA EN INGENIERÍA EN COMUNICACIONES Y ELECTRÓNICA',
      'IS75LI03Y3': 'LICENCIATURA EN INGENIERÍA EN COMUNICACIONES Y ELECTRÓNICA (YURIRIA)',
      'IS75LI0403': 'LICENCIATURA EN INGENIERÍA EN MECATRÓNICA',
      'IS75LI0502': 'LICENCIATURA EN INGENIERÍA EN SISTEMAS COMPUTACIONALES',
      'IS75LI05Y2': 'LICENCIATURA EN INGENIERÍA EN SISTEMAS COMPUTACIONALES (YURIRIA)',
      'IS75LI0602': 'LICENCIATURA EN GESTIÓN EMPRESARIAL',
      'IS75LI06Y2': 'LICENCIATURA EN GESTIÓN EMPRESARIAL (YURIRIA)',
      'IS75LI0702': 'LICENCIATURA EN ARTES DIGITALES',
      'IS75LI0801': 'LICENCIATURA EN INGENIERÍA DE DATOS E INTELIGENCIA ARTIFICIAL',
      'IS75LI08Y2': 'LICENCIATURA EN ENSEÑANZA DEL INGLÉS (YURIRIA)'
    }
    
    // Obtener usuarios con actividades aprobadas y rechazadas
    const students = await db.query(`
      SELECT DISTINCT
        u.use_id, u.use_nua, u.use_name, u.use_last_name, u.use_second_last_name,
        u.use_career, u.use_email, u.use_phone, u.use_sede
      FROM users u
      JOIN activities a ON u.use_id = a.act_user_id
      WHERE a.act_period_id = ? AND (a.act_status = 'approval' OR a.act_status = 'rejected')
      ORDER BY u.use_last_name, u.use_name
    `, [periodId])
    
    // Añadir el nombre completo de la carrera a cada estudiante
    for (const student of students) {
      student.career_full_name = `${student.use_career} - ${careerNames[student.use_career] || student.use_career}`
    }
    
    // Obtener actividades para cada estudiante
    for (const student of students) {
      student.activities = await db.query(`
        SELECT 
          act_id, act_name, act_institution, act_date_start, act_date_end,
          act_hours, act_area, act_status, act_evidence
        FROM activities
        WHERE act_user_id = ? AND act_period_id = ? 
          AND (act_status = 'approval' OR act_status = 'rejected')
      `, [student.use_id, periodId])
      
      // Procesar evidencias
      for (const activity of student.activities) {
        try {
          activity.evidenceLinks = []
          activity.evidenceBase64 = [] // Nuevo arreglo para imágenes en base64
          
          if (activity.act_evidence) {
            const evidence = JSON.parse(activity.act_evidence.toString())
            if (typeof evidence === 'object') {
              const links = Object.values(evidence)
                .flat()
                .filter(item => item)
                .slice(0, 2) // Limitar a máximo 2 imágenes
              
              // Convertir cada imagen a base64
              for (const link of links) {
                try {
                  const imagePath = path.join(__dirname, '../../uploads', link)
                  if (fs.existsSync(imagePath)) {
                    const imageBuffer = fs.readFileSync(imagePath)
                    const resizedBuffer = await sharp(imageBuffer)
                      .resize({ width: 600 }) // ajusta el ancho según lo necesario
                      .webp({ quality: 70 })  // ajusta la calidad (0-100)
                      .toBuffer();
                    const base64Image = `data:image/webp;base64,${resizedBuffer.toString('base64')}`
                    activity.evidenceBase64.push(base64Image)
                  }
                } catch (err) {
                  console.error('Error al convertir imagen a base64:', err)
                }
              }
            }
          }
        } catch (e) {
          console.error('Error al procesar evidencias:', e)
          activity.evidenceLinks = []
          activity.evidenceBase64 = []
        }
      }
    }
    
    return { period, students }
  }

  /**
   * Crea el archivo PDF con los datos usando Puppeteer
   */
  static async createPDFWithPuppeteer(reportData) {
    // Crear carpeta si no existe
    const reportDir = path.join(__dirname, '../../uploads/reports')
    fs.ensureDirSync(reportDir)

    // Ruta absoluta a la carpeta de fuentes
    const fontsPath = path.resolve(__dirname, '../fonts').replace(/\\/g, '/')

    // Nombre del archivo
    const fileName = `periodo-${reportData.period.per_name}-${Date.now()}.pdf`
    const reportPath = path.join(reportDir, fileName)

    // Registrar helpers de Handlebars
    Handlebars.registerHelper('eq', function(a, b) {
      return a === b
    })

    Handlebars.registerHelper('formatDate', function(date) {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleDateString('es-MX')
    })

    // Generar HTML con Handlebars, pasando fontsPath
    const templatePath = path.join(__dirname, '../templates/report-template.hbs')
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template no encontrado: ${templatePath}`)
    }

    const template = fs.readFileSync(templatePath, 'utf8')
    const compiledTemplate = Handlebars.compile(template)
    const html = compiledTemplate({ ...reportData, fontsPath })

    // Generar PDF con Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--font-render-hinting=none',
        '--disable-web-security',
        '--allow-file-access-from-files'
      ]
    })
    const page = await browser.newPage()

    // Cargar HTML directamente
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 60000
    })

    // Esperar a que las fuentes se carguen
    await page.evaluateHandle('document.fonts.ready')

    // Generar PDF
    await page.pdf({
      path: reportPath,
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '2cm', // Aumenta el margen inferior para el pie de página
        left: '1cm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>', // Vacío o personalizado si lo deseas
      footerTemplate: `
        <div style="width:100%;font-size:10px;color:#444;text-align:center;padding:5px 0;">
          Página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </div>
      `
    })

    await browser.close()
    return `/reports/${fileName}`
  }

  /**
   * Genera un reporte PDF filtrado por carrera y sede
   * @param {number} periodId - ID del periodo
   * @param {string} career - Clave de la carrera
   * @param {string} sede - Sede del estudiante
   * @returns {Promise<Buffer>} - Buffer del reporte PDF generado
   */
  static async generateCareerReport(periodId, career, sede) {
    // 1. Obtener los datos filtrados
    const reportData = await this.getCareerReportData(periodId, career, sede)

    // 2. Generar el PDF con el template específico para carrera
    return await this.createPDFBufferWithPuppeteer(reportData, 'report-career-template.hbs')
  }

  // Obtiene los datos filtrados por periodo, carrera y sede
  static async getCareerReportData(periodId, career, sede) {
    // Obtener información del periodo
    const [period] = await db.query(`
      SELECT per_id, per_name, per_date_start, per_date_end, per_exclusive
      FROM periods WHERE per_id = ?
    `, [periodId])
    if (!period) throw new Error('Periodo no encontrado')

    // Diccionario de carreras
    const careerNames = {
      'IS75LI0103': 'LICENCIATURA EN INGENIERÍA MECÁNICA',
      'IS75LI0203': 'LICENCIATURA EN INGENIERÍA ELÉCTRICA',
      'IS75LI0303': 'LICENCIATURA EN INGENIERÍA EN COMUNICACIONES Y ELECTRÓNICA',
      'IS75LI03Y3': 'LICENCIATURA EN INGENIERÍA EN COMUNICACIONES Y ELECTRÓNICA (YURIRIA)',
      'IS75LI0403': 'LICENCIATURA EN INGENIERÍA EN MECATRÓNICA',
      'IS75LI0502': 'LICENCIATURA EN INGENIERÍA EN SISTEMAS COMPUTACIONALES',
      'IS75LI05Y2': 'LICENCIATURA EN INGENIERÍA EN SISTEMAS COMPUTACIONALES (YURIRIA)',
      'IS75LI0602': 'LICENCIATURA EN GESTIÓN EMPRESARIAL',
      'IS75LI06Y2': 'LICENCIATURA EN GESTIÓN EMPRESARIAL (YURIRIA)',
      'IS75LI0702': 'LICENCIATURA EN ARTES DIGITALES',
      'IS75LI0801': 'LICENCIATURA EN INGENIERÍA DE DATOS E INTELIGENCIA ARTIFICIAL',
      'IS75LI08Y2': 'LICENCIATURA EN ENSEÑANZA DEL INGLÉS (YURIRIA)'
    }

    // Obtener usuarios de la carrera y sede
    const students = await db.query(`
      SELECT DISTINCT
        u.use_id, u.use_nua, u.use_name, u.use_last_name, u.use_second_last_name,
        u.use_career, u.use_email, u.use_phone, u.use_sede
      FROM users u
      JOIN activities a ON u.use_id = a.act_user_id
      WHERE a.act_period_id = ? AND u.use_career = ? AND u.use_sede = ?
      ORDER BY u.use_last_name, u.use_name
    `, [periodId, career, sede])

    if (!students || students.length === 0) {
      throw new Error('No se encontraron estudiantes con actividades para los filtros seleccionados.')
    }

    // Enriquecer data por alumno (opcional)
    for (const student of students) {
      student.career_full_name = `${student.use_career} - ${careerNames[student.use_career] || student.use_career}`
    }

    // Variables globales del reporte (iguales para todo el documento)
    const careerFullName = `${career} - ${careerNames[career] || career}`

    // Obtener actividades por alumno
    for (const student of students) {
      student.activities = await db.query(`
        SELECT 
          act_id, act_name, act_institution, act_date_start, act_date_end,
          act_hours, act_area, act_status, act_evidence
        FROM activities
        WHERE act_user_id = ? AND act_period_id = ?
      `, [student.use_id, periodId])

      for (const activity of student.activities) {
        try {
          activity.evidenceLinks = []
          activity.evidenceBase64 = []
          if (activity.act_evidence) {
            const evidence = JSON.parse(activity.act_evidence.toString())
            if (typeof evidence === 'object') {
              const links = Object.values(evidence).flat().filter(Boolean).slice(0, 2)
              for (const link of links) {
                try {
                  const imagePath = path.join(__dirname, '../../uploads', link)
                  if (fs.existsSync(imagePath)) {
                    const imageBuffer = fs.readFileSync(imagePath)
                    const resizedBuffer = await sharp(imageBuffer).resize({ width: 600 }).webp({ quality: 70 }).toBuffer()
                    const base64Image = `data:image/webp;base64,${resizedBuffer.toString('base64')}`
                    activity.evidenceBase64.push(base64Image)
                  }
                } catch (err) {
                  console.error('Error al convertir imagen a base64:', err)
                }
              }
            }
          }
        } catch {
          activity.evidenceLinks = []
          activity.evidenceBase64 = []
        }
      }
    }

    // Devolvemos las nuevas variables en el objeto raíz para el template
    return { period, students, sede, careerFullName }
  }

  // Genera el PDF y devuelve el buffer (no lo guarda en disco)
  static async createPDFBufferWithPuppeteer(reportData, templateFile = 'report-template.hbs') {
    const fontsPath = path.resolve(__dirname, '../fonts').replace(/\\/g, '/')
    const templatePath = path.join(__dirname, '../templates', templateFile)
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template no encontrado: ${templatePath}`)
    }

    // Helpers
    Handlebars.registerHelper('eq', (a, b) => a === b)
    Handlebars.registerHelper('formatDate', function (date) {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleDateString('es-MX')
    })

    const template = fs.readFileSync(templatePath, 'utf8')
    const compiledTemplate = Handlebars.compile(template)
    const html = compiledTemplate({ ...reportData, fontsPath })

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none', '--disable-web-security', '--allow-file-access-from-files']
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 })
    await page.evaluateHandle('document.fonts.ready')

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '2cm', left: '1cm' },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `
        <div style="width:100%;font-size:10px;color:#444;text-align:center;padding:5px 0;">
          Página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </div>`
    })
    await browser.close()
    return pdfBuffer
  }
}

module.exports = ReportGenerator
