import { ApplicationCardData, KanbanColumnData } from '../types/kanban';

export const kanbanService = {
    getBoardData: async (): Promise<KanbanColumnData[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return [
            {
                id: 'Collect Additional Data',
                title: 'Collect Additional Data',
                count: 2,
                totalAmount: 100000.00,
                applications: [
                    {
                        id: '1',
                        borrowerName: 'Lily Loaf',
                        refNumber: '#100066',
                        date: 'May 27, 2025',
                        amount: 0,
                        status: 'Collect Additional Data',
                        assignees: [{ name: 'AK', avatar: 'https://github.com/shadcn.png' }]
                    },
                    {
                        id: '2',
                        borrowerName: 'Olivia Cooper',
                        refNumber: '#100065',
                        date: 'Apr 10, 2025',
                        amount: 100000.00,
                        status: 'Collect Additional Data',
                        assignees: [{ name: 'AK', avatar: 'https://github.com/shadcn.png' }]
                    }
                ]
            },
            {
                id: 'Application in Progress',
                title: 'Application in Progress',
                count: 2,
                totalAmount: 0.00,
                applications: [
                    {
                        id: '3',
                        borrowerName: 'Anna K',
                        refNumber: '#100067',
                        date: 'Jul 23, 2025',
                        amount: 0,
                        status: 'Application in Progress',
                        assignees: [{ name: 'AK', avatar: 'https://github.com/shadcn.png' }]
                    },
                    {
                        id: '4',
                        borrowerName: 'John Doe',
                        refNumber: '#100064',
                        date: 'Mar 03, 2025',
                        amount: 0,
                        status: 'Application in Progress',
                        assignees: [{ name: 'AD', avatar: 'https://github.com/shadcn.png' }]
                    }
                ]
            },
            {
                id: 'Review Required',
                title: 'Review Required',
                count: 2,
                totalAmount: 13000.00,
                applications: [
                    {
                        id: '5',
                        borrowerName: 'James Martin',
                        refNumber: '#100016',
                        date: 'May 31, 2024',
                        amount: 7000.00,
                        status: 'Review Required',
                        assignees: [{ name: 'AK', avatar: 'https://github.com/shadcn.png' }]
                    },
                    {
                        id: '6',
                        borrowerName: 'Olivia Cooper',
                        refNumber: '#100012',
                        date: 'May 31, 2024',
                        amount: 6000.00,
                        status: 'Review Required',
                        assignees: [
                            { name: 'AK', avatar: 'https://github.com/shadcn.png' },
                            { name: 'TL', avatar: 'https://github.com/shadcn.png' }
                        ]
                    }
                ]
            },
            {
                id: 'Automated Decisioning',
                title: 'Automated Decisioning',
                count: 0,
                totalAmount: 0.00,
                applications: []
            },
            {
                id: 'Offers Available',
                title: 'Offers Available',
                count: 5,
                totalAmount: 27500.00,
                applications: [
                    {
                        id: '7',
                        borrowerName: 'Viktor Mane',
                        refNumber: '#100014',
                        date: 'May 31, 2024',
                        amount: 5500.00,
                        status: 'Offers Available',
                        assignees: [{ name: 'AK', avatar: 'https://github.com/shadcn.png' }]
                    },
                    {
                        id: '8',
                        borrowerName: 'Lily Choi',
                        refNumber: '#100013',
                        date: 'May 31, 2024',
                        amount: 5000.00,
                        status: 'Offers Available',
                        assignees: [
                            { name: 'AK', avatar: 'https://github.com/shadcn.png' },
                            { name: 'TL', avatar: 'https://github.com/shadcn.png' },
                            { name: 'JJ', avatar: 'https://github.com/shadcn.png' }
                        ]
                    },
                    {
                        id: '9',
                        borrowerName: 'Oscar Poole',
                        refNumber: '#100011',
                        date: 'May 31, 2024',
                        amount: 5500.00,
                        status: 'Offers Available',
                        assignees: [{ name: 'AK', avatar: 'https://github.com/shadcn.png' }]
                    }
                ]
            }
        ];
    }
};
