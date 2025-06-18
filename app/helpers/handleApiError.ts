// app/helpers/handleApiError.ts
export async function throwApiError(
    res: Response,
    fallback: string
  ): Promise<never> {
    let msg = fallback;
  
    try {
      const data = await res.clone().json();
  
      if (Array.isArray(data)) {
        // array of error strings
        msg = data.join("\n");
      } else if (typeof data === "string") {
        // plain-string JSON (rare)
        msg = data;
      } else if (data?.message || data?.error) {
        msg = data.message || data.error;
      }
    } catch {
      try {
        const text = await res.clone().text();
        if (text) msg = text;
      } catch {
        /* ignore */
      }
    }
  
    throw new Error(msg);
  }
  