import ProductForm from '@/components/admin/product-form'
import { requireAdminOrSuper } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export default async function NewProductPage() {
  await requireAdminOrSuper()
  // load categories server-side if needed by UI later
  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  return (
    <div>
      <ProductForm categories={categories} />
    </div>
  )
}
