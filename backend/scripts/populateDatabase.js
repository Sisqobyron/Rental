const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../landlord_tenant.db'));

// Sample data for Cameroon
const cameroonCities = [
  'Douala', 'Yaoundé', 'Garoua', 'Bamenda', 'Maroua', 'Bafoussam', 
  'Mokolo', 'Ngaoundéré', 'Bertoua', 'Edéa', 'Loum', 'Kumba',
  'Nkongsamba', 'Mbouda', 'Dschang', 'Kribi', 'Limbé'
];

const neighborhoodsDouala = [
  'Akwa', 'Bonanjo', 'Deido', 'New Bell', 'Bonapriso', 'Bassa', 
  'Makepe', 'Logpom', 'Kotto', 'Ndogpassi', 'Bépanda', 'Village'
];

const neighborhoodsYaounde = [
  'Centre-ville', 'Bastos', 'Nlongkak', 'Mvan', 'Emombo', 'Essos',
  'Ngousso', 'Ekounou', 'Mokolo', 'Mvog-Ada', 'Nkol-Eton', 'Kondengui'
];

const sampleUsers = [
  // Landlords
  {
    email: 'jean.ngono@gmail.com',
    password: 'password123',
    role: 'landlord',
    first_name: 'Jean',
    last_name: 'Ngono',
    phone: '+237677123456'
  },
  {
    email: 'marie.kamdem@yahoo.fr',
    password: 'password123',
    role: 'landlord',
    first_name: 'Marie',
    last_name: 'Kamdem',
    phone: '+237694234567'
  },
  {
    email: 'paul.biya@orange.cm',
    password: 'password123',
    role: 'landlord',
    first_name: 'Paul',
    last_name: 'Biya',
    phone: '+237675345678'
  },
  {
    email: 'agnes.fouda@mtn.cm',
    password: 'password123',
    role: 'landlord',
    first_name: 'Agnès',
    last_name: 'Fouda',
    phone: '+237681456789'
  },
  {
    email: 'ibrahim.hassan@nexttel.cm',
    password: 'password123',
    role: 'landlord',
    first_name: 'Ibrahim',
    last_name: 'Hassan',
    phone: '+237666567890'
  },
  // Tenants
  {
    email: 'claude.meka@gmail.com',
    password: 'password123',
    role: 'tenant',
    first_name: 'Claude',
    last_name: 'Meka',
    phone: '+237677890123'
  },
  {
    email: 'fatima.ali@yahoo.fr',
    password: 'password123',
    role: 'tenant',
    first_name: 'Fatima',
    last_name: 'Ali',
    phone: '+237694901234'
  },
  {
    email: 'bernard.tsafack@orange.cm',
    password: 'password123',
    role: 'tenant',
    first_name: 'Bernard',
    last_name: 'Tsafack',
    phone: '+237675012345'
  },
  {
    email: 'grace.nkomo@mtn.cm',
    password: 'password123',
    role: 'tenant',
    first_name: 'Grace',
    last_name: 'Nkomo',
    phone: '+237681123456'
  },
  {
    email: 'david.owona@nexttel.cm',
    password: 'password123',
    role: 'tenant',
    first_name: 'David',
    last_name: 'Owona',
    phone: '+237666234567'
  }
];

const sampleProperties = [
  // Douala properties
  {
    landlord_id: 1,
    address: 'Rue de la Liberté, Akwa',
    city: 'Douala',
    description: 'Appartement moderne de 3 chambres avec vue sur le fleuve Wouri. Climatisé, parking sécurisé.',
    rent_amount: 150000,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1200,
    is_available: 1
  },
  {
    landlord_id: 2,
    address: 'Avenue Charles de Gaulle, Bonanjo',
    city: 'Douala',
    description: 'Studio meublé au centre-ville, proche des banques et administrations.',
    rent_amount: 80000,
    bedrooms: 1,
    bathrooms: 1,
    square_feet: 400,
    is_available: 1
  },
  {
    landlord_id: 1,
    address: 'Quartier Makepe Missoke',
    city: 'Douala',
    description: 'Villa 4 chambres avec jardin, garage pour 2 voitures, générateur inclus.',
    rent_amount: 300000,
    bedrooms: 4,
    bathrooms: 3,
    square_feet: 2000,
    is_available: 0
  },
  {
    landlord_id: 3,
    address: 'Rue de Naples, Bonapriso',
    city: 'Douala',
    description: 'Appartement 2 chambres dans résidence sécurisée avec piscine.',
    rent_amount: 200000,
    bedrooms: 2,
    bathrooms: 2,
    square_feet: 900,
    is_available: 1
  },
  {
    landlord_id: 2,
    address: 'Carrefour Elf, Bassa',
    city: 'Douala',
    description: 'Maison 3 chambres, quartier populaire, proche marché central.',
    rent_amount: 100000,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 800,
    is_available: 1
  },
  
  // Yaoundé properties
  {
    landlord_id: 3,
    address: 'Avenue Kennedy, Bastos',
    city: 'Yaoundé',
    description: 'Villa de luxe 5 chambres dans quartier diplomatique, entièrement meublée.',
    rent_amount: 500000,
    bedrooms: 5,
    bathrooms: 4,
    square_feet: 3000,
    is_available: 1
  },
  {
    landlord_id: 4,
    address: 'Quartier Nlongkak',
    city: 'Yaoundé',
    description: 'Appartement 2 chambres, proche Université de Yaoundé I.',
    rent_amount: 120000,
    bedrooms: 2,
    bathrooms: 1,
    square_feet: 700,
    is_available: 1
  },
  {
    landlord_id: 5,
    address: 'Rue Mgr. Vogt, Centre-ville',
    city: 'Yaoundé',
    description: 'Bureau commercial au centre-ville, idéal pour entreprise.',
    rent_amount: 250000,
    bedrooms: 0,
    bathrooms: 2,
    square_feet: 600,
    is_available: 1
  },
  {
    landlord_id: 4,
    address: 'Mvan, derrière lycée technique',
    city: 'Yaoundé',
    description: 'Studio pour étudiant, cuisine équipée, proche transports.',
    rent_amount: 60000,
    bedrooms: 1,
    bathrooms: 1,
    square_feet: 300,
    is_available: 0
  },
  {
    landlord_id: 3,
    address: 'Essos, près pharmacie centrale',
    city: 'Yaoundé',
    description: 'Appartement familial 3 chambres, balcon, parking.',
    rent_amount: 180000,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1000,
    is_available: 1
  },

  // Other cities
  {
    landlord_id: 5,
    address: 'Quartier Mabanga',
    city: 'Garoua',
    description: 'Maison traditionnelle 4 chambres avec cour spacieuse.',
    rent_amount: 75000,
    bedrooms: 4,
    bathrooms: 2,
    square_feet: 1500,
    is_available: 1
  },
  {
    landlord_id: 1,
    address: 'Commercial Avenue, Bamenda',
    city: 'Bamenda',
    description: 'Shop space in busy commercial area, ground floor.',
    rent_amount: 100000,
    bedrooms: 0,
    bathrooms: 1,
    square_feet: 500,
    is_available: 1
  },
  {
    landlord_id: 2,
    address: 'Quartier Djamboutou',
    city: 'Bafoussam',
    description: 'Maison 3 chambres avec vue sur les montagnes.',
    rent_amount: 90000,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1100,
    is_available: 1
  },
  {
    landlord_id: 4,
    address: 'Plage de Kribi',
    city: 'Kribi',
    description: 'Villa de vacances face à la mer, 4 chambres climatisées.',
    rent_amount: 200000,
    bedrooms: 4,
    bathrooms: 3,
    square_feet: 1800,
    is_available: 1
  },
  {
    landlord_id: 5,
    address: 'Down Beach Road',
    city: 'Limbé',
    description: 'Beach house with ocean view, 2 bedrooms, furnished.',
    rent_amount: 150000,
    bedrooms: 2,
    bathrooms: 2,
    square_feet: 800,
    is_available: 1
  }
];

async function populateDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        console.log('Starting database population...');

        // Clear existing data
        db.run('DELETE FROM rent_payments');
        db.run('DELETE FROM maintenance_requests');
        db.run('DELETE FROM tenants');
        db.run('DELETE FROM messages');
        db.run('DELETE FROM properties');
        db.run('DELETE FROM users');

        console.log('Cleared existing data...');

        // Insert users
        console.log('Inserting users...');
        for (const user of sampleUsers) {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO users (email, password, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
              [user.email, hashedPassword, user.role, user.first_name, user.last_name, user.phone],
              function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
              }
            );
          });
        }

        // Insert properties
        console.log('Inserting properties...');
        for (const property of sampleProperties) {
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO properties (landlord_id, address, city, description, rent_amount, bedrooms, bathrooms, square_feet, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [property.landlord_id, property.address, property.city, property.description, property.rent_amount, property.bedrooms, property.bathrooms, property.square_feet, property.is_available],
              function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
              }
            );
          });
        }

        // Insert some tenant relationships
        console.log('Creating tenant relationships...');
        const tenantData = [
          {
            user_id: 6, // Claude Meka
            property_id: 3, // Makepe villa (not available)
            lease_start_date: '2024-01-01',
            lease_end_date: '2024-12-31',
            monthly_rent: 300000,
            deposit_amount: 600000
          },
          {
            user_id: 9, // Grace Nkomo  
            property_id: 9, // Mvan studio (not available)
            lease_start_date: '2024-09-01',
            lease_end_date: '2025-08-31',
            monthly_rent: 60000,
            deposit_amount: 120000
          }
        ];

        for (const tenant of tenantData) {
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO tenants (user_id, property_id, lease_start_date, lease_end_date, monthly_rent, deposit_amount) VALUES (?, ?, ?, ?, ?, ?)',
              [tenant.user_id, tenant.property_id, tenant.lease_start_date, tenant.lease_end_date, tenant.monthly_rent, tenant.deposit_amount],
              function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
              }
            );
          });
        }

        // Insert some sample messages
        console.log('Creating sample messages...');
        const messages = [
          {
            sender_id: 6, // Claude (tenant)
            receiver_id: 1, // Jean (landlord)
            subject: 'Problème de climatisation',
            message: 'Bonjour M. Ngono, la climatisation de la chambre principale ne fonctionne plus depuis hier. Pourriez-vous envoyer un technicien? Merci.',
            property_id: 3
          },
          {
            sender_id: 1, // Jean (landlord)
            receiver_id: 6, // Claude (tenant)
            subject: 'Re: Problème de climatisation',
            message: 'Bonjour M. Meka, j\'ai contacté le technicien. Il passera demain matin vers 9h. Merci de votre patience.',
            property_id: 3
          },
          {
            sender_id: 7, // Fatima (tenant)
            receiver_id: 2, // Marie (landlord)
            subject: 'Intérêt pour appartement Bonanjo',
            message: 'Bonjour Madame, je suis intéressée par votre studio à Bonanjo. Serait-il possible de le visiter cette semaine?'
          }
        ];

        for (const message of messages) {
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO messages (sender_id, receiver_id, subject, message, property_id) VALUES (?, ?, ?, ?, ?)',
              [message.sender_id, message.receiver_id, message.subject, message.message, message.property_id || null],
              function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
              }
            );
          });
        }

        // Insert some rent payments
        console.log('Creating rent payment records...');
        const rentPayments = [
          {
            tenant_id: 1, // Claude's tenancy
            amount: 300000,
            payment_date: '2024-01-01',
            payment_month: '2024-01',
            payment_method: 'bank_transfer',
            status: 'confirmed'
          },
          {
            tenant_id: 1,
            amount: 300000,
            payment_date: '2024-02-01',
            payment_month: '2024-02',
            payment_method: 'mobile_money',
            status: 'confirmed'
          },
          {
            tenant_id: 2, // Grace's tenancy
            amount: 60000,
            payment_date: '2024-09-01',
            payment_month: '2024-09',
            payment_method: 'cash',
            status: 'confirmed'
          },
          {
            tenant_id: 2,
            amount: 60000,
            payment_date: '2024-10-01',
            payment_month: '2024-10',
            payment_method: 'mobile_money',
            status: 'pending'
          }
        ];

        for (const payment of rentPayments) {
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO rent_payments (tenant_id, amount, payment_date, payment_month, payment_method, status) VALUES (?, ?, ?, ?, ?, ?)',
              [payment.tenant_id, payment.amount, payment.payment_date, payment.payment_month, payment.payment_method, payment.status],
              function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
              }
            );
          });
        }

        // Insert maintenance requests
        console.log('Creating maintenance requests...');
        const maintenanceRequests = [
          {
            tenant_id: 1,
            property_id: 3,
            title: 'Réparation climatisation',
            description: 'La climatisation de la chambre principale ne fonctionne plus',
            priority: 'high',
            status: 'in_progress'
          },
          {
            tenant_id: 2,
            property_id: 9,
            title: 'Fuite robinet cuisine',
            description: 'Le robinet de la cuisine goutte constamment',
            priority: 'medium',
            status: 'pending'
          }
        ];

        for (const request of maintenanceRequests) {
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO maintenance_requests (tenant_id, property_id, title, description, priority, status) VALUES (?, ?, ?, ?, ?, ?)',
              [request.tenant_id, request.property_id, request.title, request.description, request.priority, request.status],
              function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
              }
            );
          });
        }

        console.log('Database populated successfully!');
        console.log('\nSample login credentials:');
        console.log('Landlords:');
        console.log('- jean.ngono@gmail.com / password123');
        console.log('- marie.kamdem@yahoo.fr / password123');
        console.log('- paul.biya@orange.cm / password123');
        console.log('\nTenants:');
        console.log('- claude.meka@gmail.com / password123');
        console.log('- fatima.ali@yahoo.fr / password123');
        console.log('- bernard.tsafack@orange.cm / password123');

        resolve();
      } catch (error) {
        console.error('Error populating database:', error);
        reject(error);
      }
    });
  });
}

// Run the population script
populateDatabase()
  .then(() => {
    console.log('\n✅ Database population completed successfully!');
    db.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database population failed:', error);
    db.close();
    process.exit(1);
  });
