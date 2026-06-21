// Saver — Guide content. Data-driven so topics are easy to add and keep small.
// Each topic: id, icon, color (CSS var so it follows the theme), title, blurb
// (card line), intro (page line), demo (GuideDemo key), steps[], tip.

export const GUIDE = [
  {
    label: "Getting around",
    topics: [
      {
        id: "home", icon: "home", color: "var(--ac)",
        title: "Your home screen",
        blurb: "Total balance, safe to spend, and your accounts at a glance.",
        intro: "Home is where you land. The top shows what you really have and what is safe to spend after the money you set aside. Everything else is one tap away.",
        demo: "home",
        steps: [
          { icon: "eye", title: "Hide your numbers", text: "Tap the eye to mask every amount. Handy when someone is looking over your shoulder." },
          { icon: "wallet", title: "Swipe the top card", text: "Switch between Total balance and Safe to spend." },
          { icon: "chev", title: "Open any section", text: "Tap a card to jump into accounts, bills, goals and more." },
        ],
        tip: "Your amounts hide again on their own after you leave the app for a while.",
      },
      {
        id: "accounts", icon: "wallet", color: "var(--ac)",
        title: "Bank accounts",
        blurb: "Add your accounts and keep an eye on each balance.",
        intro: "Add every account and cash wallet you use. Each one gets its own colourful card, a running balance, and a low balance alert so nothing sneaks up on you.",
        demo: "accounts",
        steps: [
          { icon: "plus", title: "Add an account", text: "Give it a name, a colour and a starting balance." },
          { icon: "bell", title: "Set a low alert", text: "Saver warns you when an account runs thin." },
          { icon: "transfer", title: "Move money", text: "Send money between your own accounts in a tap." },
        ],
        tip: "Open any account to see just its transactions for the month.",
      },
      {
        id: "transfer", icon: "transfer", color: "var(--ac)",
        title: "Transfers",
        blurb: "Move money between your own accounts.",
        intro: "Need to shift money from one account to another? A transfer moves it across without counting as spending, so your totals stay honest.",
        demo: "transfer",
        steps: [
          { icon: "transfer", title: "Open an account", text: "Tap Move money on the account card." },
          { icon: "wallet", title: "Pick the other account", text: "Choose where the money should land." },
          { icon: "check", title: "Confirm the amount", text: "It moves instantly and is not counted as a spend." },
        ],
        tip: "Transfers never touch your income or spending totals.",
      },
    ],
  },
  {
    label: "Everyday money",
    topics: [
      {
        id: "add", icon: "plus", color: "var(--ac)",
        title: "Adding money in and out",
        blurb: "Record income, expenses and savings in seconds.",
        intro: "The plus button opens a simple keypad. Choose a type, type the amount, pick a category and account, and you are done. You can back date it too.",
        demo: "add",
        steps: [
          { icon: "plus", title: "Tap the plus", text: "It sits right in the middle of the bottom bar." },
          { icon: "cal", title: "Set the date", text: "Add it for today or back date an older one." },
          { icon: "layers", title: "Pick a category", text: "Choose where it belongs so your breakdown stays clean." },
        ],
        tip: "Set up Quick actions for the things you add all the time.",
      },
      {
        id: "categories", icon: "layers", color: "var(--ac)",
        title: "Categories",
        blurb: "Organise your spending with icons and colours.",
        intro: "Categories are how Saver groups your money. Each one has its own icon and colour that show up everywhere, in your activity and your breakdown.",
        demo: "categories",
        steps: [
          { icon: "layers", title: "Create a category", text: "Give it a name, pick an icon and a colour." },
          { icon: "palette", title: "Make it yours", text: "The colour follows that category all over the app." },
        ],
        tip: "Tidy categories make your monthly breakdown much easier to read.",
      },
      {
        id: "activity", icon: "activity", color: "var(--ac)",
        title: "Activity and filters",
        blurb: "Every transaction, searchable and easy to filter.",
        intro: "Activity is the full list of everything you added. Search by name, jump to a date, or open a smart filter to narrow things down by category, account or type.",
        demo: "activity",
        steps: [
          { icon: "search", title: "Search anything", text: "Type a name or note to find a transaction fast." },
          { icon: "cal", title: "Filter by date", text: "Pick a day or a range to focus your view." },
          { icon: "funnel", title: "Smart filter", text: "Combine categories, accounts and types for a clean answer." },
        ],
        tip: "Tap any transaction to edit it, anywhere you see it.",
      },
      {
        id: "quick", icon: "zap", color: "var(--ac)",
        title: "Quick actions",
        blurb: "Save your most common transactions for one tap.",
        intro: "Add the things you log over and over, like your morning coffee, as a quick action. Then one tap records it with the amount and account already set.",
        demo: "quick",
        steps: [
          { icon: "zap", title: "Create a quick action", text: "Pick a category, amount and account." },
          { icon: "plus", title: "Tap to log it", text: "Long press the add button to reach them fast." },
        ],
        tip: "Great for daily habits you do not want to type out every time.",
      },
    ],
  },
  {
    label: "Plan ahead",
    topics: [
      {
        id: "goals", icon: "target", color: "var(--ac)",
        title: "Saving goals",
        blurb: "Set a target, freeze money, and watch it grow.",
        intro: "A goal is a little vault. You set a target and add to it whenever you can. Frozen money is kept safe and taken out of safe to spend, so you never spend it by accident.",
        demo: "goals",
        steps: [
          { icon: "target", title: "Create a goal", text: "Give it a name, a target and an icon." },
          { icon: "lock", title: "Freeze some money", text: "It moves out of safe to spend and waits for you." },
          { icon: "sparkles", title: "Hit your target", text: "A little celebration when you finally get there." },
        ],
        tip: "When the time comes, you can spend straight from a goal.",
      },
      {
        id: "spendgoal", icon: "target", color: "var(--ac)",
        title: "Spend from a goal",
        blurb: "Turn a goal into a spending pot when you are ready.",
        intro: "When you have saved enough, switch a goal into spending mode. Now you can pay straight from it and watch the pot go down, instead of dipping into your everyday money.",
        demo: "spendgoal",
        steps: [
          { icon: "target", title: "Open the goal", text: "Pick the goal you are ready to use." },
          { icon: "lock", title: "Turn on spending", text: "Flip it into spending mode in one tap." },
          { icon: "arrowDown", title: "Pay from the pot", text: "Each spend comes out of the goal, not your balance." },
        ],
        tip: "Perfect for a holiday fund or a big planned purchase.",
      },
      {
        id: "bills", icon: "bills", color: "var(--ac)",
        title: "Bills and installments",
        blurb: "Keep every recurring payment on your radar.",
        intro: "Add your subscriptions and installment plans once. Saver reminds you before each one is due and keeps a clean history of what you paid.",
        demo: "bills",
        steps: [
          { icon: "bills", title: "Add a bill", text: "Pick a brand or make your own, then set the amount and due day." },
          { icon: "bell", title: "Get a reminder", text: "A gentle heads up a few days before it is due." },
          { icon: "check", title: "Mark it paid", text: "It records a real expense and moves into your history." },
        ],
        tip: "Installments show you how many payments are left.",
      },
      {
        id: "budgets", icon: "sparkles", color: "var(--ac)",
        title: "Budgets and projects",
        blurb: "Set a monthly cap or track a one off project.",
        intro: "A budget is a monthly cap for a group of categories. A project is a pot you track until it is done, like setting up a new home. The ring shows how much is left at a glance.",
        demo: "budgets",
        steps: [
          { icon: "sparkles", title: "Create a budget", text: "Choose monthly or a project, then pick the categories." },
          { icon: "target", title: "Set the cap", text: "Decide how much you want to keep it under." },
          { icon: "cal", title: "Check any month", text: "Use the month chip to look back at how you did." },
        ],
        tip: "The ring turns colour as you get close to your limit.",
      },
    ],
  },
  {
    label: "See and stay in control",
    topics: [
      {
        id: "breakdown", icon: "target", color: "var(--ac)",
        title: "Breakdown",
        blurb: "See where your money really goes each month.",
        intro: "Breakdown sorts your spending and income by category for any month. The biggest item sits on top, and each category gets a bar in its own colour.",
        demo: "breakdown",
        steps: [
          { icon: "cal", title: "Choose a month", text: "Tap the month chip to look at any month." },
          { icon: "layers", title: "Read the bars", text: "Each bar is a category, longest is where most went." },
        ],
        tip: "Switch between Spending and Income with the toggle on top.",
      },
      {
        id: "notifications", icon: "bell", color: "var(--ac)",
        title: "Notifications",
        blurb: "Friendly nudges about bills, goals and low balances.",
        intro: "Saver keeps a small inbox of things worth knowing, like a bill that is due soon or an account running low. Tap one to jump straight to it.",
        demo: "notifications",
        steps: [
          { icon: "bell", title: "Open the bell", text: "Find it at the top of your home screen." },
          { icon: "chev", title: "Tap to jump", text: "Each notification takes you right to what it is about." },
          { icon: "check", title: "Mark as read", text: "Clear them once you have had a look." },
        ],
        tip: "A dot on the bell means something new is waiting.",
      },
      {
        id: "privacy", icon: "shield", color: "var(--ac)",
        title: "Privacy and backup",
        blurb: "Your data stays yours. Back it up any time.",
        intro: "Everything lives on your device. No ads, no tracking, nothing sold. When you want a safety copy, export a backup file you can keep or restore later.",
        demo: "privacy",
        steps: [
          { icon: "download", title: "Download a backup", text: "Save a small file with all your data." },
          { icon: "download", title: "Restore any time", text: "Bring everything back from a backup file." },
          { icon: "lock", title: "Stay private", text: "Nothing leaves your phone unless you send it." },
        ],
        tip: "A reset always saves a backup first, just in case.",
      },
    ],
  },
  {
    label: "Make it yours",
    topics: [
      {
        id: "customize", icon: "grip", color: "var(--ac)",
        title: "Customise your home",
        blurb: "Reorder the sections or hide the ones you skip.",
        intro: "Your home screen is yours. Drag the sections into the order that suits you, and hide any you do not use, so the first thing you see is the thing that matters most.",
        demo: "customize",
        steps: [
          { icon: "grip", title: "Drag to reorder", text: "Hold a section and move it up or down." },
          { icon: "eye", title: "Hide what you skip", text: "Turn off any section you do not need." },
        ],
        tip: "Put the section you check most right at the top.",
      },
      {
        id: "appearance", icon: "palette", color: "var(--ac)",
        title: "Appearance",
        blurb: "Light, dark, or follow your phone. Plus accent colours.",
        intro: "Choose light, dark, or let Saver follow your phone. Then pick an accent colour that flows through the whole app.",
        demo: "appearance",
        steps: [
          { icon: "sun", title: "Pick a theme", text: "Light, dark, or System to match your phone." },
          { icon: "palette", title: "Choose an accent", text: "One colour sets the mood across the app." },
        ],
        tip: "System theme switches with your phone automatically, day and night.",
      },
      {
        id: "currency", icon: "coins", color: "var(--ac)",
        title: "Currency",
        blurb: "Show every amount in the currency you use.",
        intro: "Set your currency once and every amount across the app uses it, with a small symbol that never gets in the way of the number.",
        demo: "currency",
        steps: [
          { icon: "coins", title: "Open Currency", text: "Find it in Edit profile under Preferences." },
          { icon: "check", title: "Pick yours", text: "Choose from the list, each with its flag." },
        ],
        tip: "The currency symbol stays small so big numbers stay easy to read.",
      },
      {
        id: "install", icon: "share", color: "var(--ac)",
        title: "Add Saver to your home screen",
        blurb: "Open Saver like a real app, in one tap.",
        intro: "Put Saver on your home screen and it opens full screen, just like a native app. It only takes a few seconds.",
        demo: "install",
        steps: [
          { icon: "share", title: "Tap Share", text: "You will find it in your browser bar." },
          { icon: "plus", title: "Add to Home Screen", text: "Scroll the menu until you see it." },
          { icon: "home", title: "Open from your screen", text: "From now on it works just like an app." },
        ],
        tip: "Once added, your splash screen and icon show up too.",
      },
    ],
  },
];

// Short, plain answers to the questions people ask most.
export const FAQ = [
  { q: "Why are my amounts hidden?", a: "Saver masks your numbers by default to keep them private. Tap the eye on your home screen to show them, and they hide again after you have been away for a while." },
  { q: "What does safe to spend mean?", a: "It is your balance minus the money you froze in goals, so the number you see is what you can really spend without touching your plans." },
  { q: "How do I back up my data?", a: "Open Profile, then Privacy and backup, and tap Download backup. Keep that file somewhere safe. You can restore from it any time." },
  { q: "Does my data ever leave my phone?", a: "No. Everything lives on your device. There are no ads, no tracking, and nothing is sent anywhere unless you export a backup yourself." },
  { q: "Can I change my currency?", a: "Yes. Open Profile, tap Edit profile, then Currency, and pick the one you use. Every amount updates to match." },
];

export const findTopic = (id) => {
  for (const g of GUIDE) { const t = g.topics.find((x) => x.id === id); if (t) return t; }
  return null;
};
