export default function CustomersPage() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">Manage your customer relationships and data.</p>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <p className="text-sm text-muted-foreground">No customers found.</p>
            </div>
        </div>
    );
}
