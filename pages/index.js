// This example shows you how to set up React Stripe.js and use Elements.
// Learn how to accept a payment using the official Stripe docs.
// https://www.stripe.com/docs/payments/integration-builder

import React from "react";
import CheckoutForm from '../components/stripe/CheckoutForm'
import { Elements } from "@stripe/react-stripe-js";

import styles from "../styles/styles.module.css";
import getStripe from '../utils/get-stripejs'



const ELEMENTS_OPTIONS = {
  fonts: [
    {
      cssSrc: "https://fonts.googleapis.com/css?family=Roboto"
    }
  ]
};


const Home = () => {
  return (
    <div className={styles.AppWrapper}>
      <Elements stripe={getStripe()} options={ELEMENTS_OPTIONS}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};

export default Home;
