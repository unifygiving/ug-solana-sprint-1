"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import styles from "./success.module.css";

interface StripeSession {
  id: string;
  amount_total: number;
  payment_intent: string;
  payment_status: string;
  customer_email?: string;
  customer_details?: {
    email?: string;
  };
}

function SuccessContent() {
  const [session, setSession] = useState<StripeSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      const fetchSession = async (): Promise<void> => {
        try {
          const { data } = await axios.get<StripeSession>(
            `/api/checkout-session?sessionId=${sessionId}`
          );
          setSession(data);
        } catch (error) {
          console.error("Error fetching session:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchSession();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className={styles.main}>
        <div className={styles.container}>
          <h1>No payment information found</h1>
          <Link href="/" className={styles.link}>
            Return to checkout
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.main}>
        <div className={styles.loading}>Loading payment details...</div>
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>✓</div>
        <h1 className={styles.title}>Payment Successful!</h1>

        {session && (
          <div className={styles.paymentDetails}>
            <p>
              <strong>Amount:</strong> ${session.amount_total / 100}
            </p>
            <p>
              <strong>Payment ID:</strong> {session.payment_intent}
            </p>
            <p>
              <strong>Status:</strong> {session.payment_status}
            </p>
          </div>
        )}

        <p>
          Thank you for your payment. We have sent a confirmation email to your
          registered email address.
        </p>

        <Link href="/" className={styles.button}>
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function Success() {
  return (
    <Suspense
      fallback={
        <div className={styles.main}>
          <div className={styles.loading}>Loading payment details...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
