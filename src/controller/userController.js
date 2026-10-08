const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
//const bcrypt = require('bcrypt')
//const crypto = require('crypto')
//const nodemailer = require('nodemailer')

/*const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})
*/

/**
 * Obtiene todos los usuarios registrados.
 * @route GET /users
 */
const getAllUsers = async (req, res) => {
  try {
    if (!['superadmin', 'admin'].includes(req.adminRole)) {
      return res.status(403).json({ success: false, message: 'NO TIENES PERMISOS PARA CONSULTAR USUARIOS' })
    }
    const users = await User.getAllUsers()
    const teachers = users.filter(u => u.isTeacher)
    const students = users.filter(u => !u.isTeacher)
    res.status(200).json({
      teachers,
      students,
      success: true,
      message: users.length > 0
        ? 'USUARIOS OBTENIDOS CORRECTAMENTE'
        : 'NO SE ENCONTRARON USUARIOS'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Envía un código de verificación al correo institucional del estudiante.
 * @route POST /users/send-verification-code
 */
/*const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'EL CORREO ELECTRÓNICO ES OBLIGATORIO'
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Validar que sea un correo institucional
    const emailRegex = /^[^\s@]+@ugto\.mx$/

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'EL CORREO ELECTRÓNICO DEBE SER INSTITUCIONAL (@ugto.mx)'
      })
    }

    // Verificar que el correo no pertenezca ya a otro usuario
    const alreadyRegistered = await User.emailExists(normalizedEmail)

    if (alreadyRegistered) {
      return res.status(409).json({
        success: false,
        message: 'EL CORREO ELECTRÓNICO YA ESTÁ REGISTRADO'
      })
    }

    // Generar código seguro de seis dígitos
    const verificationCode = crypto
      .randomInt(100000, 1000000)
      .toString()

    // Guardar solamente el hash del código
    const codeHash = await bcrypt.hash(
      verificationCode,
      10
    )

    // El código tendrá una vigencia de 10 minutos
    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    )

    await User.saveEmailVerification(
      normalizedEmail,
      codeHash,
      expiresAt
    )

    // Enviar código por correo electrónico
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: normalizedEmail,
      subject: 'Código de verificación - MiCAFÉ',
      text:
        `Tu código de verificación de MiCAFÉ es: ${verificationCode}\n\n` +
        'Este código expirará en 10 minutos.\n\n' +
        'Si tú no solicitaste este código, puedes ignorar este mensaje.'
    })

    return res.status(200).json({
      success: true,
      message: 'CÓDIGO DE VERIFICACIÓN ENVIADO AL CORREO INSTITUCIONAL'
    })
  } catch (err) {
    console.error(
      'Error al enviar código de verificación:',
      err
    )

    return res.status(500).json({
      success: false,
      message: 'NO SE PUDO ENVIAR EL CÓDIGO DE VERIFICACIÓN'
    })
  }
} */


/**
 * Comprueba el código enviado al correo electrónico.
 * @route POST /users/verify-email-code
 */
/*const verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'CORREO Y CÓDIGO DE VERIFICACIÓN SON OBLIGATORIOS'
      })
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase()

    const verification =
      await User.getEmailVerification(normalizedEmail)

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'NO EXISTE UNA VERIFICACIÓN PENDIENTE PARA ESTE CORREO'
      })
    }

    // Comprobar expiración
    if (
      new Date(verification.ev_expires_at).getTime() <
      Date.now()
    ) {
      await User.deleteEmailVerification(
        normalizedEmail
      )

      return res.status(400).json({
        success: false,
        message: 'EL CÓDIGO DE VERIFICACIÓN HA EXPIRADO'
      })
    }

    // Máximo cinco intentos por código
    if (verification.ev_attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'DEMASIADOS INTENTOS. SOLICITA UN NUEVO CÓDIGO.'
      })
    }

    const codeIsValid = await bcrypt.compare(
      code.toString(),
      verification.ev_code_hash
    )

    if (!codeIsValid) {
      await User.incrementVerificationAttempts(
        normalizedEmail
      )

      return res.status(400).json({
        success: false,
        message: 'CÓDIGO DE VERIFICACIÓN INCORRECTO'
      })
    }

    // Código correcto: eliminarlo para que no pueda reutilizarse
    await User.deleteEmailVerification(
      normalizedEmail
    )

    // Token temporal que autoriza a crear una cuenta con este correo
    const verificationToken = jwt.sign(
      {
        email: normalizedEmail,
        type: 'email_verification'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '15m'
      }
    )

    return res.status(200).json({
      success: true,
      message: 'CORREO ELECTRÓNICO VERIFICADO CORRECTAMENTE',
      verificationToken
    })
  } catch (err) {
    console.error(
      'Error al verificar correo:',
      err
    )

    return res.status(500).json({
      success: false,
      message: 'ERROR AL VERIFICAR EL CORREO ELECTRÓNICO'
    })
  }
} */

/**
 * Crea un nuevo usuario.
 * Requiere que el correo electrónico haya sido verificado previamente.
 * @route POST /users/create-user
 */

// Solo cuando implemente la verificacion de correo
/*const createUser = async (req, res) => {
  try {
    const {
      verificationToken,
      ...data
    } = req.body

    if (!verificationToken) {
      return res.status(403).json({
        success: false,
        message: 'DEBES VERIFICAR TU CORREO ELECTRÓNICO ANTES DE REGISTRARTE'
      })
    }

    let verification

    try {
      verification = jwt.verify(
        verificationToken,
        process.env.JWT_SECRET
      )
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: 'LA VERIFICACIÓN DEL CORREO HA EXPIRADO O NO ES VÁLIDA'
      })
    }

    if (
      verification.type !== 'email_verification'
    ) {
      return res.status(403).json({
        success: false,
        message: 'TOKEN DE VERIFICACIÓN NO VÁLIDO'
      })
    }

    if (!data.email) {
      return res.status(400).json({
        success: false,
        message: 'EL CORREO ELECTRÓNICO ES OBLIGATORIO'
      })
    }

    const normalizedEmail =
      data.email.trim().toLowerCase()

    // El correo registrado debe ser exactamente
    // el mismo que fue verificado
    if (
      verification.email !== normalizedEmail
    ) {
      return res.status(403).json({
        success: false,
        message: 'EL CORREO REGISTRADO NO COINCIDE CON EL CORREO VERIFICADO'
      })
    }

    data.email = normalizedEmail

    const newUserId =
      await User.createUser(data)

    res.status(201).json({
      id: newUserId,
      success: true,
      message: 'USUARIO CREADO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: false
    })
  }
} */

/**
 * Actualiza los datos de un usuario.
 * @route PUT /users/update-user/:id
 */

// Sin verificacion de correo
/**
 * Crea un nuevo usuario.
 * @route POST /users/create-user
 */
const createUser = async (req, res) => {
  try {
    const data = req.body

    const newUserId = await User.createUser(data)

    res.status(201).json({
      id: newUserId,
      success: true,
      message: 'USUARIO CREADO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: false
    })
  }
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    if (Number(id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'NO PUEDES MODIFICAR OTRO USUARIO' })
    }
    const data = req.body
    const updated = await User.updateUser(req.user.id, data)
    if (updated) {
      res.status(200).json({
        success: true,
        message: 'USUARIO ACTUALIZADO CORRECTAMENTE'
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'NO SE ENCONTRÓ EL USUARIO O NO HUBO CAMBIOS'
      })
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Actualiza la contraseña de un usuario.
 * @route PUT /users/update-password/:id
 */
const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params
    const { newPassword } = req.body

    if (req.user && Number(id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'NO PUEDES CAMBIAR LA CONTRASEÑA DE OTRO USUARIO' })
    }

    const targetId = req.user ? req.user.id : id
    const updated = await User.updatePassword(targetId, newPassword)
    if (updated) {
      res.status(200).json({
        success: true,
        message: 'CONTRASEÑA ACTUALIZADA CORRECTAMENTE'
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'NO SE ENCONTRÓ EL USUARIO O NO HUBO CAMBIOS'
      })
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Elimina un usuario del sistema.
 * @route DELETE /users/delete-user/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    await User.deleteUser(id)
    res.status(200).json({
      success: true,
      message: 'USUARIO ELIMINADO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Inicia sesión un usuario.
 * @route POST /users/login
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.login(email, password)
    const token = jwt.sign(
      { id: user.id, isTeacher: user.isTeacher, type: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )
    res.cookie('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    })
    res.json({
      success: true,
      message: 'LOGIN EXITOSO',
      user
    })
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Obtiene la información de un usuario por su ID.
 * @route GET /users/get-user/:id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    if (Number(id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'NO PUEDES CONSULTAR OTRO USUARIO' })
    }
    const user = await User.getUserById(req.user.id)
    res.status(200).json({
      success: true,
      user
    })
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Obtiene todos los estudiantes con la información de sus actividades enviadas.
 * Solo accesible para admin y superadmin.
 * @route GET /users/students-with-activities
 */
const getAllUsersWithActivities = async (req, res) => {
  try {
    // Validar rol (debe venir del middleware de autenticación)
    const role = req.admin?.role
    if (role !== 'admin' && role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'NO AUTORIZADO'
      })
    }

    const students = await User.getAllUsersWithActivities()
    res.status(200).json({
      success: true,
      students
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Obtiene el perfil del estudiante autenticado.
 * @route GET /users/profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id // Viene del middleware de autenticación
    const user = await User.getUserById(userId)
    res.status(200).json({
      success: true,
      user
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Actualiza el perfil del estudiante autenticado.
 * Permite actualizar: nombre, apellidos, teléfono, email, NUA, carrera, sede.
 * @route PUT /users/update-profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, lastName, secondLastName, email, phone, nua, career, sede } = req.body;

    // Validar campos requeridos
    if (!name || !lastName || !email || !phone || !nua || !career || !sede) {
      return res.status(400).json({
        success: false,
        message: 'TODOS LOS CAMPOS SON OBLIGATORIOS'
      });
    }

    // Validar formato de NUA
    if (isNaN(nua) || nua.toString().length < 6) {
      return res.status(400).json({
        success: false,
        message: 'EL NUA DEBE TENER AL MENOS 6 DÍGITOS'
      });
    }

    // Validar formato de email
    const emailRegex = /.+@ugto\.mx$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'EL CORREO ELECTRÓNICO DEBE SER INSTITUCIONAL (@ugto.mx)'
      });
    }

    // Validar longitud del teléfono (debe ser 10 dígitos)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'EL TELÉFONO DEBE TENER 10 DÍGITOS'
      });
    }

    // Validar carrera
    const validCareers = [
      "IS75LI0103",
      "IS75LI0203",
      "IS75LI0303",
      "IS75LI03Y3",
      "IS75LI0403",
      "IS75LI0502",
      "IS75LI05Y2",
      "IS75LI0602",
      "IS75LI06Y2",
      "IS75LI0702",
      "IS75LI0801",
      "IS75LI08Y2",
    ];
    if (!validCareers.includes(career)) {
      return res.status(400).json({
        success: false,
        message: 'LA CARRERA SELECCIONADA NO ES VÁLIDA'
      });
    }

    // Validar sede
    const validSedes = ["SALAMANCA", "YURIRIA"];
    if (!validSedes.includes(sede.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'LA SEDE DEBE SER "SALAMANCA" O "YURIRIA"'
      });
    }

    // Actualizar todos los campos de perfil (incluye NUA, carrera, sede)
    const data = {
      nua: Number(nua),
      name,
      lastName,
      secondLastName: secondLastName || null,
      email,
      phone: phoneDigits,
      career,
      sede: sede.toUpperCase()
    };

    const updated = await User.updateUserProfile(userId, data);
    
    if (updated) {
      res.status(200).json({
        success: true,
        message: 'PERFIL ACTUALIZADO CORRECTAMENTE'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'NO SE PUDO ACTUALIZAR EL PERFIL'
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
}

module.exports = {
  getAllUsers,
  createUser,
  //sendVerificationCode,
  //verifyEmailCode,
  updateUser,
  updateUserPassword,
  deleteUser,
  loginUser,
  getUserById,
  getAllUsersWithActivities,
  getProfile,
  updateProfile
}
