import { prisma } from "@/lib/prisma/prisma";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";

function getAdminBusinessStatus(business: {
  verificationStatus: string;
  verificationRequests: { status: string }[];
}) {
  if (business.verificationStatus === "APPROVED") {
    return "Approved";
  }
  if (business.verificationStatus === "REJECTED") {
    return "Rejected";
  }
  if (business.verificationRequests.length === 0) {
    return "Draft";
  }
  if (business.verificationStatus === "UNDER_REVIEW") {
    return "Under review";
  }
  return "Pending review";
}

export default async function AdminBusinessesPage() {
  const businesses = await prisma.business.findMany({
    select: {
      id: true,
      businessName: true,
      slug: true,
      verificationStatus: true,
      isPublished: true,
      createdAt: true,
      category: { select: { name: true } },
      owner: { select: { email: true } },
      verificationRequests: {
        select: { status: true },
        orderBy: { submittedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Business</TableHeaderCell>
            <TableHeaderCell>Category</TableHeaderCell>
            <TableHeaderCell>Owner</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Published</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {businesses.map((business) => (
            <TableRow key={business.id}>
              <TableCell>
                <Link
                  href={`/businesses/${business.slug}`}
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  {business.businessName}
                </Link>
              </TableCell>
              <TableCell>{business.category.name}</TableCell>
              <TableCell>{business.owner.email}</TableCell>
              <TableCell>{getAdminBusinessStatus(business)}</TableCell>
              <TableCell>{business.isPublished ? "Yes" : "No"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </article>
  );
}
