// src/lib/xapi.ts
import axios from "axios";

type XAPIEvent = {
  actor: any;
  verb: any;
  object: any;
  result?: any;
  timestamp?: string;
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export default async function sendXAPIEvent(event: XAPIEvent){
  try{
    await axios.post(`${BACKEND_URL}/api/events`, event);
  }catch(err){
    console.warn("xAPI send failed", err);
  }
}

