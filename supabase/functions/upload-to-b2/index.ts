import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { encodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts"
import { corsHeaders } from "../_shared/cors.ts"

const B2_KEY_ID = Deno.env.get("B2_KEY_ID")
const B2_MASTER_KEY = Deno.env.get("B2_MASTER_KEY")
const B2_BUCKET_NAME = Deno.env.get("B2_BUCKET_NAME")

async function authorizeB2() {
  try {
    // Create basic auth header for B2
    const credentialsString = `${B2_KEY_ID}:${B2_MASTER_KEY}`
    const credentialsBase64 = encodeBase64(credentialsString)

    console.log("B2 Auth attempting...")

    const response = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentialsBase64}`,
      },
    })

    const responseText = await response.text()
    console.log("B2 Auth response status:", response.status)

    if (!response.ok) {
      console.error("B2 Auth error response:", responseText)
      throw new Error(`B2 Auth failed: ${response.statusText} - ${responseText}`)
    }

    const data = JSON.parse(responseText)
    return data
  } catch (error) {
    console.error("B2 Authorization error:", error)
    throw error
  }
}

async function getUploadUrl(authToken: string, apiUrl: string) {
  try {
    const response = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: "POST",
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucketId: B2_BUCKET_NAME,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to get upload URL: ${response.statusText} - ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Get Upload URL error:", error)
    throw error
  }
}

async function sha1(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-1", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  try {
    const { file, folder = "", fileName: originalFileName } = await req.json()

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Decode base64 file to binary
    const binaryString = atob(file)
    const fileBytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      fileBytes[i] = binaryString.charCodeAt(i)
    }

    console.log("Starting B2 upload, file size:", fileBytes.length)

    // Authorize with B2
    const authData = await authorizeB2()
    const { authorizationToken, apiUrl, downloadUrl } = authData

    // Get upload URL
    const uploadUrlData = await getUploadUrl(authData.authorizationToken, apiUrl)
    const { uploadUrl, authorizationToken: uploadToken } = uploadUrlData

    // Generate filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileName = `${folder}${timestamp}-${randomStr}-${originalFileName}`

    // Calculate SHA1
    const hashHex = await sha1(fileBytes)

    // Upload file
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: uploadToken,
        "X-Bz-File-Name": encodeURIComponent(fileName),
        "X-Bz-Content-Sha1": hashHex,
      },
      body: fileBytes,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error("B2 Upload error:", uploadResponse.status, errorText)
      throw new Error(`Upload failed: ${uploadResponse.statusText}`)
    }

    const uploadResult = await uploadResponse.json()
    const publicUrl = `${downloadUrl}/file/${B2_BUCKET_NAME}/${encodeURIComponent(fileName)}`

    console.log("Upload successful:", fileName)

    return new Response(
      JSON.stringify({
        success: true,
        fileName: uploadResult.fileName,
        fileId: uploadResult.fileId,
        publicUrl,
        contentSha1: uploadResult.contentSha1,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("B2 Upload Error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Upload failed",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
