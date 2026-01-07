//api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
export async function apiFetch<T>(
    path:string,
    options: RequestInit = {}

): Promise<T>{
    const res = await fetch('${API_BASE}${path}',{
       ...options,
       credentials: "include",
       headers:{
        "Content-Type": "application/json",
        ...(options.headers || {}),
       }
    });

    if(!res.ok){
        let message = "Request failed";
        try{
            const data = await res.json();
            message = data?.message || message;

        }catch{

        }
        throw new Error(message);
    }
    return res.json() as Promise<T>;
}

