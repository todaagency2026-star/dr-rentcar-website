const sgMail = require('@sendgrid/mail');

exports.handler = async (event) => {
  // Solo POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Metodo non consentito' })
    };
  }

  try {
    // Parsa i dati del form
    const data = JSON.parse(event.body);

    const { nome, cognome, email, telefono, servizio, messaggio } = data;

    // Validazione
    if (!nome || !cognome || !email || !telefono || !servizio || !messaggio) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Tutti i campi sono obbligatori'
        })
      };
    }

    // Valida email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'L\'email non è valida'
        })
      };
    }

    // Configura SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Email al proprietario
    const emailToOwner = {
      to: 'dr.rentcar.cusano@gmail.com',
      from: 'noreply@dr-rentcar.com',
      replyTo: email,
      subject: `Nuova richiesta di preventivo da ${nome} ${cognome}`,
      html: `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
              .header { background: linear-gradient(135deg, #d00a1b, #1e293b); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: white; padding: 20px; border-radius: 0 0 8px 8px; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #d00a1b; margin-bottom: 5px; }
              .value { background: #f5f5f5; padding: 10px; border-left: 3px solid #d00a1b; border-radius: 4px; }
              .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>📧 Nuova Richiesta di Preventivo</h2>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">👤 Nome:</div>
                  <div class="value">${nome}</div>
                </div>
                <div class="field">
                  <div class="label">👤 Cognome:</div>
                  <div class="value">${cognome}</div>
                </div>
                <div class="field">
                  <div class="label">✉️ Email:</div>
                  <div class="value"><a href="mailto:${email}">${email}</a></div>
                </div>
                <div class="field">
                  <div class="label">📱 Telefono / WhatsApp:</div>
                  <div class="value"><a href="tel:${telefono}">${telefono}</a></div>
                </div>
                <div class="field">
                  <div class="label">🎯 Tipo di Servizio:</div>
                  <div class="value">${servizio}</div>
                </div>
                <div class="field">
                  <div class="label">💬 Messaggio:</div>
                  <div class="value">${messaggio.replace(/\n/g, '<br>')}</div>
                </div>
                <div class="footer">
                  <p>Questo è un messaggio automatico da Dr. Rent Car.</p>
                  <p>Rispondi a questa email per contattare il cliente.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `
    };

    // Email di conferma al cliente
    const emailToClient = {
      to: email,
      from: 'noreply@dr-rentcar.com',
      subject: 'Abbiamo ricevuto la tua richiesta - Dr. Rent Car',
      html: `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
              .header { background: linear-gradient(135deg, #d00a1b, #1e293b); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: white; padding: 20px; border-radius: 0 0 8px 8px; }
              .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>✅ Grazie per il tuo interesse</h2>
              </div>
              <div class="content">
                <p>Ciao <strong>${nome}</strong>,</p>
                <p>Abbiamo ricevuto la tua richiesta di preventivo. Il nostro team ti contatterà entro poche ore tramite WhatsApp o telefono al numero <strong>${telefono}</strong>.</p>
                <h3 style="color: #d00a1b;">📞 Contattaci direttamente:</h3>
                <ul>
                  <li><strong>📱 WhatsApp:</strong> <a href="https://wa.me/39351160532" style="color: #d00a1b; text-decoration: none;">+39 351 160 0532</a></li>
                  <li><strong>📍 Indirizzo:</strong> Via Carlo Sormani 65, Cusano Milanino (MI)</li>
                  <li><strong>🌐 Sito:</strong> <a href="https://dr-rentcar.com" style="color: #d00a1b; text-decoration: none;">dr-rentcar.com</a></li>
                </ul>
                <p style="margin-top: 20px;">Cordiali saluti,<br><strong>Il team di Dr. Rent Car</strong></p>
                <div class="footer">
                  <p>20 anni al servizio della mobilità.</p>
                  <p>Noleggio e vendita auto a Cusano Milanino.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `
    };

    // Invia entrambe le email
    await sgMail.send(emailToOwner);
    await sgMail.send(emailToClient);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Richiesta inviata con successo! Ti contatteremo entro poche ore.'
      })
    };

  } catch (error) {
    console.error('Errore:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Si è verificato un errore durante l\'invio. Contatta direttamente via WhatsApp: +39 351 160 0532'
      })
    };
  }
};
