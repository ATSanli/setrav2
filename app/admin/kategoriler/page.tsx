import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CategoryActionMenu from '@/components/admin/category-action-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { prisma } from '@/lib/prisma'

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } }, children: true },
      orderBy: { sortOrder: 'asc' }
    })
    return categories
  } catch (e) {
    return []
  }
}

async function CategoriesTable() {
  const categories = await getCategories()

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Categories ({categories.length})</CardTitle>
        <div>
          <Button asChild>
            <Link href="/admin/kategoriler/yeni">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Children</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-sm text-muted-foreground">{cat.description || ''}</p>
                    </div>
                  </TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell>{cat._count?.products || 0}</TableCell>
                  <TableCell>{cat.children?.length || 0}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <CategoryActionMenu id={cat.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No categories found</p>
            <Button asChild>
              <Link href="/admin/kategoriler/yeni">
                <Plus className="mr-2 h-4 w-4" />
                Add First Category
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminCategoriesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif">Kategoriler</h1>
          <p className="text-muted-foreground">Kategorileri yönetin</p>
        </div>
        <div></div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <CategoriesTable />
      </Suspense>
    </div>
  )
}
