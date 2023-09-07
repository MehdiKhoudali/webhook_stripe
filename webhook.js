const express = require('express');

const stripeSecretKey = process.env.STRIPE_SECRETKEY
const stripe = require('stripe')(stripeSecretKey);

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const endpointSecret = process.env.ENDPOINT_SECRET;
const port = process.env.PORT || 3000

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {

  const sig = req.headers['stripe-signature'];

  let event;
  let payload = req.body;
  let userEmail;
  let customerData;

  try {
    payload = req.body

    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);

  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.created':

      customerData = await stripe.customers.retrieve(
        event.data.object.customer,
        {
          apiKey: stripeSecretKey
        }
      );

      userEmail = customerData.email
      
      if (userEmail) {
          console.log(userEmail)
      }

      break;

    case 'customer.subscription.updated':

      customerData = await stripe.customers.retrieve(
        event.data.object.customer,
        {
          apiKey: stripeSecretKey
        }
      );

      userEmail = customerData.email;

      if (userEmail) {
          console.log(userEmail)
      }
      
      break;

    case 'customer.subscription.deleted':

      customerData = await stripe.customers.retrieve(
        event.data.object.customer,

        {
          apiKey: stripeSecretKey
        }
      );

      userEmail = customerData.email;

      if (userEmail) {
          console.log(userEmail)
      }

      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
      res.status(400).send('index.js - POST "/webhook unhandled eventType"');
  }

  res.status(200).send('index.js - POST "/webhook"');
});

app.get('/', express.raw({ type: 'application/json' }), (req, res) => {
  console.log(`index.js - GET "/"`);

  res.status(200).send('index.js - GET "/"');
});

app.listen(port, () => {
  console.log(`index.js Server is listening on port ${port}`);
});

module.exports = app;
