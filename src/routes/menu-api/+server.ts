import { json, text } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ request }) => {
  try {
    const url = "https://api.hfs.purdue.edu/menus/v3/GraphQL"

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: await request.text(),
    })

    return text(await response.text(), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  } catch (err) {
    return json({ error: err.message }, { status: 500 })
  }
}
