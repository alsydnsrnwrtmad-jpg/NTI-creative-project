const pages = [

    // Dashboard

    {
        output: './index.html',
        content: {
            title: 'Sofra Admin | Dashboard',
            description: 'Restaurant management dashboard for Sofra.',
            heading_icon: 'pe-7s-rocket icon-gradient bg-mean-fruit'
        },
        template: './src/DemoPages/dashboards/dashboard-example-1.hbs'
    },

    // Menu

    {
        output: './meals-all.html',
        content: {
            title: 'Sofra Admin | Meals',
            description: 'Manage your restaurant meals.',
            heading_icon: 'pe-7s-cup icon-gradient bg-happy-fisher'
        },
        template: './src/DemoPages/sofra/meals-all.hbs'
    },
    {
        output: './meals-add.html',
        content: {
            title: 'Sofra Admin | Add Meal',
            description: 'Add or edit a meal.',
            heading_icon: 'pe-7s-plus icon-gradient bg-happy-fisher'
        },
        template: './src/DemoPages/sofra/meals-add.hbs'
    },
    {
        output: './meals-categories.html',
        content: {
            title: 'Sofra Admin | Categories',
            description: 'Manage your meal categories.',
            heading_icon: 'pe-7s-note2 icon-gradient bg-happy-fisher'
        },
        template: './src/DemoPages/sofra/categories.hbs'
    },

    // Orders

    {
        output: './orders.html',
        content: {
            title: 'Sofra Admin | Orders',
            description: 'Manage customer orders.',
            heading_icon: 'pe-7s-cart icon-gradient bg-happy-fisher'
        },
        template: './src/DemoPages/sofra/orders.hbs'
    },

    // Customers

    {
        output: './customers.html',
        content: {
            title: 'Sofra Admin | Customers',
            description: 'Manage your restaurant customers.',
            heading_icon: 'pe-7s-users icon-gradient bg-happy-fisher'
        },
        template: './src/DemoPages/sofra/customers.hbs'
    },

    // Reviews

    {
        output: './reviews.html',
        content: {
            title: 'Sofra Admin | Reviews',
            description: 'Manage customer reviews.',
            heading_icon: 'pe-7s-comment icon-gradient bg-happy-fisher'
        },
        template: './src/DemoPages/sofra/reviews.hbs'
    },

    // Reports

    {
        output: './reports.html',
        content: {
            title: 'Sofra Admin | Reports',
            description: 'View sales, orders and customer reports.',
            heading_icon: 'pe-7s-graph3 icon-gradient bg-happy-fisher'
        },
        template: './src/DemoPages/sofra/reports.hbs'
    },

    // Settings

    {
        output: './settings.html',
        content: {
            title: 'Sofra Admin | Settings',
            description: 'Manage your restaurant settings.',
            heading_icon: 'pe-7s-config icon-gradient bg-happy-fisher'
        },
        template: './src/DemoPages/sofra/settings.hbs'
    },
];

module.exports = pages;
