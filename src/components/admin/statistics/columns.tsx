"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AdClick } from "@/lib/types"

export const columns: ColumnDef<AdClick>[] = [
  {
    accessorKey: "adName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre del Anuncio
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        return <div className="font-medium">{row.getValue("adName")}</div>
    }
  },
  {
    accessorKey: "page",
    header: "Página",
    cell: ({ row }) => {
        return <div className="capitalize">{row.getValue("page")}</div>
    }
  },
    {
    accessorKey: "adUrl",
    header: "URL del Anuncio",
    cell: ({ row }) => {
        const url = row.getValue("adUrl") as string;
        return (
             <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate max-w-xs block">
                {url}
            </a>
        )
    }
  },
  {
    accessorKey: "clickedAt",
    header: "Fecha del Clic",
    cell: ({ row }) => {
      const date = new Date(row.getValue("clickedAt"))
      const formattedDate = date.toLocaleString()
      return <div>{formattedDate}</div>
    },
  },
]
