"use client";

import { useEffect, useState } from "react";
import { applicationClient } from "@/core/api/grpc-client";
import { ListApplicationsResponse } from "@/gen/application/v1/application_pb";

export const GrpcExample = () => {
    const [data, setData] = useState<ListApplicationsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await applicationClient.listApplications({
                    pageSize: 10,
                    cursor: "",
                });
                setData(response);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-slate-900">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">
                gRPC Applications List
            </h2>
            <ul className="space-y-2">
                {data?.applications.map((app) => (
                    <li key={app.id} className="p-2 border-b last:border-0 border-slate-200 dark:border-slate-700">
                        <span className="font-medium text-blue-600 dark:text-blue-400">{app.id}</span>
                        <span className="ml-2 text-slate-600 dark:text-slate-400">- {app.status}</span>
                    </li>
                ))}
            </ul>
            {data?.applications.length === 0 && (
                <p className="text-slate-500 italic">No applications found.</p>
            )}
        </div>
    );
};
