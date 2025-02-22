// deno-lint-ignore-file no-unused-vars prefer-const
import {Client, UserID, Signature } from "@diskuto/client"
import type * as protobuf from "@diskuto/client/types"

import { assert, assertEquals, assertExists } from "@std/assert";


const OFFICIAL_FEOBLOG = UserID.fromString("A719rvsCkuN2SC5W2vz5hypDE2SpevNTUsEXrVFe9XQ7")
const FIRST_POST = Signature.fromString("2F6NB6PYKDTPGTc9dfaQHpmPzd3LSjVgBuC6qa2hcLUJA74LbZpV8wL5HoXDmvzyfZWaX6sLyg3DoGtqh3t2rJt5")
const FIRST_SERVER = "https://blog.nfnitloop.com"

Deno.test("fetching an item", async () => {
    let client = new Client({baseUrl: FIRST_SERVER})

    let item = await client.getItem(OFFICIAL_FEOBLOG, FIRST_POST)
    assert(item != null)

    assertEquals(1611105596861n, item.timestampMsUtc)

    let itemType = item.itemType
    assert(itemType.case == "post")
    let post = itemType.value
    assert(post != null)

    assertEquals("Hello, World!", post.title)

    let body = post.body
    assert(body != null)

    assert(body.includes("first post"))
    console.log("body", body)
})

Deno.test("Fetching all posts", async() => {
    let client = new Client({baseUrl: FIRST_SERVER})

    for await (let entry of client.getUserItems(OFFICIAL_FEOBLOG)) {
        let sig = Signature.fromBytes(entry?.signature?.bytes!)
        let item = await client.getItem(OFFICIAL_FEOBLOG, sig)

        showPost({item, sig, entry})
    }
})

Deno.test("Fetching only some posts", async() => {
    let client = new Client({baseUrl: FIRST_SERVER})

    const publicReleaseTimestamp = 1611195863721
    let entries = client.getUserItems(OFFICIAL_FEOBLOG, {before: publicReleaseTimestamp + 1})
    let count = 0
    for await (let entry of entries) { count++ }
    assertEquals(3, count)
})

Deno.test(async function profileItem() {
    const client = new Client({baseUrl: FIRST_SERVER})
    const profile = await client.getProfile(OFFICIAL_FEOBLOG)
    assertExists(profile)
    console.log("displayName:", profile.item.itemType.value.displayName)
})


function showPost(arg0: { item: protobuf.Item|null; sig: Signature; entry: protobuf.ItemListEntry; }) {
    let {item, sig, entry} = arg0


    console.log("---")
    console.log("ts:", entry.timestampMsUtc)
    console.log("sig:", sig.asBase58)
    console.log("type:", item?.itemType.case)
    console.log("value:", item?.itemType?.value)
    console.log("")
}
