const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.generateSubscriptionOrders = onSchedule(
  {
    schedule: "every day 04:00",
    timeZone: "Asia/Kolkata",
  },
  async () => {
    console.log("Running subscription auto-order job...");

    const snapshot = await db.collection("subscriptions").get();

    for (const doc of snapshot.docs) {
      const sub = doc.data();

      // Only active subscriptions
      if (sub.status !== "active") continue;

      // Skip invalid data (VERY IMPORTANT)
      if (!sub.customerId || !sub.quantity || !sub.timeSlot) {
        console.log("Skipping invalid subscription:", sub);
        continue;
      }

      await db.collection("orders").add({
        customerId: sub.customerId,
        quantity: sub.quantity,
        timeSlot: sub.timeSlot,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        type: "subscription",
      });

      console.log("Order created for:", sub.customerId);
    }
  }
);