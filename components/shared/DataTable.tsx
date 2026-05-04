"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export type Column<T> = {
  header: string;
  accessorKey: keyof T | string;
  cell?: (row: T) => React.ReactNode;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  isLoading = false,
  getRowId,
  emptyContent,
}: {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  getRowId?: (row: T) => string;
  emptyContent?: React.ReactNode;
}) {
  const [mountDelayDone, setMountDelayDone] = React.useState(false);

  React.useEffect(() => {
    const t = window.setTimeout(() => setMountDelayDone(true), 400);
    return () => window.clearTimeout(t);
  }, []);

  const loading = isLoading || !mountDelayDone;
  const showEmpty = !loading && data.length === 0 && emptyContent;

  function cellValue(row: T, col: Column<T>) {
    if (col.cell) return col.cell(row);
    const key = col.accessorKey as keyof T;
    const v = row[key];
    if (v === null || v === undefined) return "—";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((c) => (
              <TableHead key={String(c.accessorKey)}>{c.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {columns.map((c) => (
                    <TableCell key={String(c.accessorKey)}>
                      <Skeleton className="h-4 w-full max-w-[120px] animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : showEmpty
              ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="p-0">
                      {emptyContent}
                    </TableCell>
                  </TableRow>
                )
              : data.map((row, idx) => (
                  <TableRow
                    key={
                      getRowId
                        ? getRowId(row)
                        : (row.id as string) ?? String(idx)
                    }
                    className={cn(
                      onRowClick &&
                        "cursor-pointer hover:bg-[#1892ff]/10 focus-visible:bg-[#1892ff]/10"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((c) => (
                      <TableCell key={String(c.accessorKey)}>
                        {cellValue(row, c)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
        </TableBody>
      </Table>
    </div>
  );
}
