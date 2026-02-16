export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account and application preferences.</p>
            <div className="grid gap-6">
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Profile</h2>
                    <div className="space-y-4">
                        <div className="h-10 w-full rounded-md bg-muted/20" />
                        <div className="h-10 w-full rounded-md bg-muted/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}
