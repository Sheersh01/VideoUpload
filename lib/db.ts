import { connect } from "http2";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error("Please define mongodb-uri in env variable")
}

let cached = global.mongoose

if (!cached) {
   cached = global.mongoose={conn:null,promise:null}
}

export async function connectToDatabase(){
    if(cached.conn) {
        return cached.conn
    }
    if (!cached.promise) {
        const ops = {
            bufferCommans: true,
            maxPoolSize:10
        }

        mongoose.connect(MONGODB_URI).then(()=>mongoose.connection,ops)
    }
    try {
        cached.conn = await cached.promise
    } catch (error) {
        cached.promise = null
        throw error
    }
    return cached.conn
}