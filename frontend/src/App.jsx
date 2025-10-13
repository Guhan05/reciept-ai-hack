import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function App(){
  const [file, setFile] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [txns, setTxns] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(()=>{ fetchTxns(); },[]);

  async function fetchTxns(){
    const r = await axios.get(`${API}/transactions`);
    setTxns(r.data.transactions || []);
  }

  async function upload(){
    if(!file) return alert("choose file");
    const form = new FormData();
    form.append("file", file);
    const r = await axios.post(`${API}/upload`, form, { headers: {"Content-Type": "multipart/form-data"}});
    setReceipts(prev => [r.data.receipt, ...prev]);
    fetchTxns();
  }

  async function ask(){
    if(!question) return;
    setAnswer("Thinking...");
    const r = await axios.post(`${API}/chat`, { question });
    setAnswer(r.data.answer);
  }

  return (
    <div className="container">
      <h1>Receipt AI — Hackathon Demo</h1>

      <section>
        <h3>Upload Receipt</h3>
        <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files[0])}/>
        <button onClick={upload}>Upload & Parse</button>
        <div>
          <h4>Parsed Receipts</h4>
          <ul>
            {receipts.map(r => <li key={r.id}>{r.filename} — Merchant: {r.ocr_fields?.merchant} — Total: {r.ocr_fields?.total}</li>)}
          </ul>
        </div>
      </section>

      <section>
        <h3>Transactions</h3>
        <ul>
          {txns.map(t => <li key={t.id}>{t.date} | {t.merchant} | {t.amount}</li>)}
        </ul>
      </section>

      <section className="chat">
        <h3>Ask the AI</h3>
        <input value={question} onChange={e=>setQuestion(e.target.value)} style={{width:'100%',padding:8}} placeholder="How much did I spend on food this week?"/>
        <button onClick={ask}>Ask</button>
        <div style={{marginTop:12}}>
          <strong>AI:</strong>
          <div>{answer}</div>
        </div>
      </section>
    </div>
  );
}
