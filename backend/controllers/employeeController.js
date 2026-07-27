// controllers/employeeController.js
import Employee from '../models/Employee.js'; // Importamos el modelo de la colección 'base'

// @desc    Obtener todos los empleados (con opción de filtrado por turno o rol)
// @route   GET /api/employees
// @access  Privado (Cualquier usuario autenticado)
export const getEmployees = async (req, res) => {
  try {
    // Permitimos filtrar por query params ej: /api/employees?shift=Mañana
    const filter = {};
    if (req.query.shift) filter.shift = req.query.shift;
    if (req.query.corporateRole) filter.corporateRole = req.query.corporateRole;

    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la plantilla', error: error.message });
  }
};

// @desc    Obtener un empleado por ID
// @route   GET /api/employees/:id
// @access  Privado
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar el empleado', error: error.message });
  }
};

// @desc    Crear un nuevo empleado
// @route   POST /api/employees
// @access  Privado (Solo 'Encargado Plantilla')
export const createEmployee = async (req, res) => {
  try {
    const { fullName, dni, email, phone, corporateRole, shift, department } = req.body;

    // Comprobar si ya existe un empleado con el mismo DNI o Email
    const existingEmployee = await Employee.findOne({ $or: [{ dni }, { email }] });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Ya existe un empleado con ese DNI o correo' });
    }

    const employee = new Employee({
      fullName,
      dni,
      email,
      phone,
      corporateRole,
      shift,
      department,
      updatedBy: req.user._id, // Guardamos la referencia de qué admin creó el registro
    });

    const createdEmployee = await employee.save();
    res.status(201).json(createdEmployee);
  } catch (error) {
    res.status(400).json({ message: 'Datos de empleado no válidos', error: error.message });
  }
};

// @desc    Actualizar datos o turno de un empleado
// @route   PUT /api/employees/:id
// @access  Privado ('Encargado Plantilla' y 'Manejador Horarios')
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    // POLITICA DE ROLES INTERNA:
    // Si es 'Manejador Horarios', solo le permitimos modificar el campo 'shift' (turno) y 'status'
    if (req.user.role === 'Manejador Horarios') {
      employee.shift = req.body.shift || employee.shift;
      employee.status = req.body.status || employee.status;
    } else {
      // Si es 'Encargado Plantilla' (Admin), puede editar cualquier campo
      employee.fullName = req.body.fullName || employee.fullName;
      employee.dni = req.body.dni || employee.dni;
      employee.email = req.body.email || employee.email;
      employee.phone = req.body.phone || employee.phone;
      employee.corporateRole = req.body.corporateRole || employee.corporateRole;
      employee.shift = req.body.shift || employee.shift;
      employee.department = req.body.department || employee.department;
      employee.status = req.body.status || employee.status;
    }

    employee.updatedBy = req.user._id;
    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el empleado', error: error.message });
  }
};

// @desc    Eliminar un empleado de la plantilla
// @route   DELETE /api/employees/:id
// @access  Privado (Solo 'Encargado Plantilla')
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    await employee.deleteOne();
    res.json({ message: 'Empleado eliminado de la base de datos correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el empleado', error: error.message });
  }
};