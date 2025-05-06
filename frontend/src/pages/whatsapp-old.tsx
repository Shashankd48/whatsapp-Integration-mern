import { useEffect, useState } from "react";
import axios from "axios";

function WhatsApp() {
   const [qr, setQr] = useState(null);
   const [connected, setConnected] = useState(false);
   const [number, setNumber] = useState("");
   const [message, setMessage] = useState("");
   const [sending, setSending] = useState(false);

   const fetchQr = async () => {
      try {
         const res = await axios.get("http://localhost:5000/qr");
         if (res.data.status === "authenticated") {
            setConnected(true);
            setQr(null);
         } else {
            setConnected(false);
            setQr(res.data.qr);
         }
      } catch (error) {
         console.error("Failed to fetch QR:", error);
      }
   };

   const handleSend = async () => {
      if (!number || !message) return alert("Enter number and message");
      setSending(true);
      try {
         await axios.post("http://localhost:5000/send", {
            number,
            message,
         });
         alert("Message sent!");
         setNumber("");
         setMessage("");
      } catch (err) {
         alert("Failed to send message");
         console.error(err);
      }
      setSending(false);
   };

   useEffect(() => {
      fetchQr();
      const interval = setInterval(fetchQr, 5000); // check QR status every 5s
      return () => clearInterval(interval);
   }, []);

   useEffect(() => {
      const checkStatus = async () => {
         const res = await axios.get("http://localhost:5000/status");
         setConnected(res.data.status === "authenticated");
      };

      checkStatus();
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
   }, []);

   return (
      <div style={{ padding: "2rem", fontFamily: "Arial" }}>
         <h1>WhatsApp Integration</h1>

         {!connected && qr && (
            <div>
               <h3>Scan the QR Code</h3>
               <img src={qr} alt="QR Code" style={{ width: 300 }} />
            </div>
         )}

         {connected && (
            <div style={{ marginTop: "2rem" }}>
               <h2>Send Message</h2>
               <input
                  type="text"
                  placeholder="Phone number (e.g., 919999999999)"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  style={{
                     display: "block",
                     marginBottom: 10,
                     width: "100%",
                     padding: 8,
                  }}
               />
               <textarea
                  placeholder="Your message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  style={{
                     display: "block",
                     marginBottom: 10,
                     width: "100%",
                     padding: 8,
                  }}
               />
               <button onClick={handleSend} disabled={sending}>
                  {sending ? "Sending..." : "Send Message"}
               </button>
            </div>
         )}
      </div>
   );
}

export default WhatsApp;
