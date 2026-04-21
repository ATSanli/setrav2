import NewsletterManager from '@/components/admin/newsletter-manager'

export default function AdminNewsletterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Newsletter Subscribers</h1>
      <NewsletterManager />
    </div>
  )
}
