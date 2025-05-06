import { useEffect, useState } from "react";
import axios from "axios";

const host = import.meta.env.VITE_BACKEND;

function WhatsApp() {
   const [userId, setUserId] = useState("");
   const [entered, setEntered] = useState(false);
   const [qr, setQr] = useState(null);
   const [connected, setConnected] = useState(false);
   const [number, setNumber] = useState("");
   const [message, setMessage] = useState("");
   const [sending, setSending] = useState(false);

   const fetchQr = async () => {
      if (!userId) return;
      try {
         const res = await axios.get(`${host}/qr/${userId}`);
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

   const checkStatus = async () => {
      if (!userId) return;
      try {
         const res = await axios.get(`${host}/status/${userId}`);
         setConnected(res.data.status === "authenticated");
      } catch (error) {
         console.error("Status check failed:", error);
      }
   };

   const handleSend = async () => {
      if (!number || !message) return alert("Enter number and message");
      setSending(true);
      try {
         await axios.post(`${host}/send`, {
            userId,
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
      if (!entered) return;
      fetchQr();
      const qrInterval = setInterval(fetchQr, 5000);
      return () => clearInterval(qrInterval);
   }, [userId, entered]);

   useEffect(() => {
      if (!entered) return;
      checkStatus();
      const statusInterval = setInterval(checkStatus, 5000);
      return () => clearInterval(statusInterval);
   }, [userId, entered]);

   const handleUserIdSubmit = () => {
      if (!userId || userId.length < 10) {
         return alert(
            "Please enter a valid mobile number (e.g., 919999999999)"
         );
      }
      setEntered(true);
   };

   return (
      <div style={{ padding: "2rem", fontFamily: "Arial" }}>
         <h1>WhatsApp Integration</h1>

         {!entered ? (
            <div>
               <h3>Enter your mobile number to begin</h3>
               <input
                  type="text"
                  placeholder="Mobile number (e.g., 919999999999)"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  style={{
                     marginRight: 10,
                     padding: 8,
                     width: 300,
                  }}
               />
               <button onClick={handleUserIdSubmit}>Continue</button>
            </div>
         ) : (
            <>
               {!connected && qr && (
                  <div style={{ marginTop: "2rem" }}>
                     <h3>Scan the QR Code to authenticate</h3>
                     <img src={qr} alt="QR Code" style={{ width: 300 }} />
                     <p>Keep WhatsApp open on your phone while scanning.</p>
                  </div>
               )}

               {connected && (
                  <div style={{ marginTop: "2rem" }}>
                     <h2>Send Message as {userId}</h2>
                     <input
                        type="text"
                        placeholder="Recipient number (e.g., 919999999999)"
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
            </>
         )}
      </div>
   );
}

export default WhatsApp;
