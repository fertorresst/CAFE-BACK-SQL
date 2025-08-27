const express = require('express');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Crear un servidor Express
const app = express();
const port = 3030;

// Registrar los helpers de Handlebars
Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

Handlebars.registerHelper('formatDate', function(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-MX');
});

// Ruta para previsualizar la plantilla
app.get('/', (req, res) => {
  // Cargar la plantilla
  const templatePath = path.join(__dirname, '../templates/report-template.hbs');
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  const template = Handlebars.compile(templateSource);
  
  // Datos de muestra similares a los reales
  const sampleData = {
    period: {
      per_name: "EJ24-02E",
      per_date_start: "2024-01-15",
      per_date_end: "2024-07-01",
      per_exclusive: true
    },
    students: [
      {
        use_id: 1,
        use_nua: 100001,
        use_name: "María",
        use_last_name: "García",
        use_second_last_name: "Sánchez",
        use_career: "IS75LI0203",
        career_full_name: "IS75LI0203 - LICENCIATURA EN INGENIERÍA ELÉCTRICA",
        use_email: "maria.garcia@unach.mx",
        use_phone: "4612000001",
        use_sede: "YURIRIA",
        activities: [
          {
            act_id: 1,
            act_name: "Seminario de Liderazgo",
            act_institution: "UNACH",
            act_date_start: "2024-05-03",
            act_date_end: "2024-07-03",
            act_hours: 10,
            act_area: "RS/VCI",
            act_status: "approval",
            evidenceBase64: [
              "https://via.placeholder.com/200x150"
            ]
          },
          {
            act_id: 2,
            act_name: "Curso de Excel Avanzado",
            act_institution: "Microsoft",
            act_date_start: "2024-02-10",
            act_date_end: "2024-03-10",
            act_hours: 15,
            act_area: "DP",
            act_status: "rejected",
            evidenceBase64: []
          }
        ]
      },
      {
        use_id: 2,
        use_nua: 100002,
        use_name: "Juan",
        use_last_name: "Pérez",
        use_second_last_name: "López",
        use_career: "IS75LI0502",
        career_full_name: "IS75LI0502 - LICENCIATURA EN INGENIERÍA EN SISTEMAS COMPUTACIONALES",
        use_email: "juan.perez@unach.mx",
        use_phone: "4612000002",
        use_sede: "SALAMANCA",
        activities: [
          {
            act_id: 3,
            act_name: "Taller de Innovación",
            act_institution: "Instituto de Innovación",
            act_date_start: "2024-02-01",
            act_date_end: "2024-02-28",
            act_hours: 20,
            act_area: "CEE",
            act_status: "approval",
            evidenceBase64: [
              "https://via.placeholder.com/200x150",
              "https://via.placeholder.com/200x150"
            ]
          }
        ]
      }
    ]
  };
  
  // Renderizar la plantilla con los datos de muestra
  const html = template(sampleData);
  
  // Devolver el HTML
  res.send(html);
});

// Servir la carpeta de fuentes de forma estática
const fontsPath = path.resolve(__dirname, '../fonts');
app.use('/fonts', express.static(fontsPath));

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor de previsualización ejecutándose en http://localhost:${port}`);
  console.log(`Presiona Ctrl+C para detener.`);
});
