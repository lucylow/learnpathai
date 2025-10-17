// src/lib/xapi.ts
import axios from "axios";

type XAPIActor = {
  objectType?: string;
  mbox?: string;
  name?: string;
};

type XAPIVerb = {
  id: string;
  display?: Record<string, string>;
};

type XAPIObject = {
  id: string;
  objectType?: string;
  definition?: Record<string, unknown>;
};

type XAPIResult = {
  score?: { scaled?: number; raw?: number; min?: number; max?: number };
  success?: boolean;
  completion?: boolean;
  duration?: string;
};

type XAPIEvent = {
  actor: XAPIActor;
  verb: XAPIVerb;
  object: XAPIObject;
  result?: XAPIResult;
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

