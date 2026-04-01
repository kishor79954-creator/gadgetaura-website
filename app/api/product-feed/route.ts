import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, description, price, image_url, status, stock')
      .eq('status', 'active')

    if (error) {
      console.error('Product feed error:', error)
    }

    const baseUrl = 'https://www.gadgetaura.in'

    const items = (products || [])
      .map((p) => {
        const price = Number(p.price).toFixed(2)
        const title = (p.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        const desc = (p.description || `Premium gadget from GadgetAura: ${p.name}`).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 5000)
        const imageUrl = p.image_url || `${baseUrl}/logo.png`
        const productUrl = `${baseUrl}/products/detail/${p.id}`
        const inStock = p.stock == null || p.stock > 0

        return `
    <item>
      <g:id>${p.id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${inStock ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${price} INR</g:price>
      <g:brand>GadgetAura</g:brand>
      <g:google_product_category>Electronics</g:google_product_category>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard</g:service>
        <g:price>0 INR</g:price>
      </g:shipping>
    </item>`
      })
      .join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>GadgetAura Product Feed</title>
    <link>${baseUrl}</link>
    <description>GadgetAura - Premium Gadgets Store</description>
    ${items}
  </channel>
</rss>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (err) {
    console.error('Product feed fatal error:', err)
    return new NextResponse('Error generating feed', { status: 500 })
  }
}
