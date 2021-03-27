import React, { useState } from 'react'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Field, CardField, SubmitButton, ErrorMessage, ResetButton } from './Formcomps'
import styles from './styles.module.css'
import { fetchPostJSON } from '../../utils/api-helpers'



const CheckoutForm = () => {
   const stripe = useStripe();
   const elements = useElements();
   const [payment, setPayment] = useState({ status: 'initial' })
   const [errorMessage, setErrorMessage] = useState('')

   const [error, setError] = useState(null);
   const [cardComplete, setCardComplete] = useState(false);
   const [processing, setProcessing] = useState(false);
   const [paymentMethod, setPaymentMethod] = useState(null);
   const [billingDetails, setBillingDetails] = useState({
      email: "",
      phone: "",
      name: ""
   });

   const PaymentStatus = ({ status }) => {
      switch (status) {
         case 'processing':
         case 'requires_payment_method':
         case 'requires_confirmation':
            return <h2>Processing...</h2>

         case 'requires_action':
            return <h2>Authenticating...</h2>

         case 'succeeded':
            return <h2>Payment Succeeded 🥳</h2>

         case 'error':
            return (
               <>
                  <h2>Error 😭 {errorMessage?.message}</h2>
                  <h2>{errorMessage?.message}</h2>
               </>
            )

         default:
            return null
      }
   }

   const handleSubmit = async (event) => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return
      setPayment({ status: 'processing' })

      if (!stripe || !elements) {
         // Stripe.js has not loaded yet. Make sure to disable
         // form submission until Stripe.js has loaded.
         return;
      }
      const response = await fetchPostJSON('/api/stripe/payment_intents', {
         amount: 100,
      })
      setPayment(response)

      if (response.statusCode === 500) {
         setPayment({ status: 'error' })
         setErrorMessage(response.message)
         return
      }

      // Get a reference to a mounted CardElement. Elements knows how
      // to find your CardElement because there can only ever be one of
      // each type of element.
      const cardElement = elements.getElement(CardElement)

      // Use your card Element with other Stripe.js APIs
      const { error, paymentIntent } = await stripe.confirmCardPayment(
         response.client_secret,
         {
            payment_method: {
               card: cardElement,
               billing_details: { name: billingDetails.name, email: billingDetails.email, phone: billingDetails.phone },
            },
         }
      )

      if (error) {
         setPayment({ status: 'error' })
         setErrorMessage(error.message ?? 'An unknown error occured')
      } else if (paymentIntent) {
         setPayment(paymentIntent)
      }


   };

   const reset = () => {
      setErrorMessage(null);
      setProcessing(false);
      setPayment({ status: 'initial' });
      setBillingDetails({
         email: "",
         phone: "",
         name: ""
      });
   };

   return payment.status === 'succeeded' ? (
      <div className={styles.Result}>
         <div className={styles.ResultTitle} role="alert">
            Payment successful
         </div>
         <div className={styles.ResultMessage}>
            Thanks for trying Stripe Elements. No money was charged, but we
            generated a PaymentMethod: {payment.id}
         </div>
         <ResetButton onClick={reset} />
      </div>
   ) : (
      <>
         <form className={styles.Form} onSubmit={handleSubmit}>
            <fieldset className={styles.FormGroup}>
               <Field
                  label="Name"
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  required
                  autoComplete="name"
                  value={billingDetails.name}
                  onChange={(e) => {
                     setBillingDetails({ ...billingDetails, name: e.target.value });
                  }}
               />
               <Field
                  label="Email"
                  id="email"
                  type="email"
                  placeholder="janedoe@gmail.com"
                  required
                  autoComplete="email"
                  value={billingDetails.email}
                  onChange={(e) => {
                     setBillingDetails({ ...billingDetails, email: e.target.value });
                  }}
               />
               <Field
                  label="Phone"
                  id="phone"
                  type="tel"
                  placeholder="(941) 555-0123"
                  required
                  autoComplete="tel"
                  value={billingDetails.phone}
                  onChange={(e) => {
                     setBillingDetails({ ...billingDetails, phone: e.target.value });
                  }}
               />
            </fieldset>
            <fieldset className={styles.FormGroup}>
               <CardField
                  onChange={(e) => {
                     setErrorMessage(e.error?.message);
                     setCardComplete(e.complete);
                  }}
               />
            </fieldset>
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            <SubmitButton processing={payment.status === 'processing'} error={errorMessage} disabled={!stripe}>
               Pay $100
            </SubmitButton>
         </form>
         <PaymentStatus status={payment.status} />
      </>
   );
};

export default CheckoutForm;