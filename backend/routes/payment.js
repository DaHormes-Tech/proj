
const express = require("express");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");
const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.post("/pay", async (req, res) => {
  const { email, amount } = req.body;
  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      { email, amount: amount * 100 },
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET}` } }
    );
    await supabase.from("payments").insert([{ email, amount, status: "pending", reference: response.data.data.reference }]);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Payment initialization failed" });
  }
});

router.get("/verify/:reference", async (req, res) => {
  const { reference } = req.params;
  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET}` }
    });
    if (response.data.data.status === "success") {
      await supabase.from("payments").update({ status: "successful" }).eq("reference", reference);
      res.json({ message: "Payment successful" });
    } else {
      res.status(400).json({ message: "Payment failed" });
    }
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
});

module.exports = router;

