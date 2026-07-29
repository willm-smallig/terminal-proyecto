// backend/seed.js
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Employee from './models/Employee.js';

dotenv.config();

const seedData = async () => {
  try {
    // Conexión a MongoDB Atlas
    await connectDB();

    console.log('Limpiando colecciones anteriores en "database"...');
    await User.deleteMany();
    await Employee.deleteMany();

    console.log('Creando usuarios personalizados para la prueba...');

    // Usuario Admin dedicado al profesor Carmelo
    const carmeloAdmin = await User.create({
      username: 'Carmelo_mandanga',
      email: 'carmelo@company.com',
      password: 'sudoadmin123', // Encriptado automático por el hook pre-save en User.js
      role: 'Encargado Plantilla',
    });

    // Manejador de Horarios
    const luisScheduler = await User.create({
      username: 'Luis_horarios',
      email: 'luis@company.com',
      password: 'userPassword123',
      role: 'Manejador Horarios',
    });

    // Plantilla Mañana
    const manuMarketing = await User.create({
      username: 'Manu_marquetin',
      email: 'manu@company.com',
      password: 'userPassword123',
      role: 'Plantilla Mañana',
    });

    console.log('USUARIOS CREADOS EXITOSAMENTE:');
    console.log(' Admin Prof  - User: Carmelo_mandanga | Pass: sudoadmin123  | Rol: Encargado Plantilla');
    console.log(' Scheduler   - User: Luis_horarios    | Pass: userPassword123 | Rol: Manejador Horarios');
    console.log(' Operativo   - User: Manu_marquetin   | Pass: userPassword123 | Rol: Plantilla Mañana');

    console.log('\n Insertando plantilla de empleados iniciales en la colección "base"...');

    await Employee.create([
      {
        fullName: 'Cristian React Pérez',
        dni: '12345678A',
        email: 'cristian.react@company.com',
        phone: '600111222',
        corporateRole: 'Plantilla Mañana',
        shift: 'Mañana',
        department: 'Atención al Cliente',
        status: 'Activo',
        updatedBy: carmeloAdmin._id,
      },
      {
        fullName: 'William CSS Roto',
        dni: '87654321B',
        email: 'william.css@company.com',
        phone: '600333444',
        corporateRole: 'Plantilla Tarde',
        shift: 'Tarde',
        department: 'Atención al Cliente',
        status: 'Activo',
        updatedBy: carmeloAdmin._id,
      },
    ]);

    console.log('Empleados insertados en la colección "base"');
    console.log('\nProceso finalizado con éxito. Pulsa Ctrl + C para salir de este proceso.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la ejecución del seed:', error.message);
    process.exit(1);
  }
};

seedData();