export default function OrdersPage() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">Monitor and manage customer orders.</p>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <p className="text-sm text-muted-foreground">No orders history yet.</p>
            </div>
        </div>
    );
}
