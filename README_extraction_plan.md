# Extraction Plan Update

The extraction of files from `App.tsx` is moving forward.
I have exported the components of different tabs (Admin, Dash, Marketplace, Mlm, Profile, Report, Seller, Txn) as `.tmp.tsx` files inside `src/components/tabs/`. 
The problem is that the state and many handler functions are declared at the root level of `App.tsx` and used within these components. Making them independent files would require passing dozens of props (state, setState, handlers) down to them, which can be messy and hard to maintain without using a State Management tool (Context API or Redux) or custom hooks.

To solve this we can either:
1.  Extract the logic to a massive context `AppContext.tsx` or multiple smaller contexts (e.g. `AuthContext`, `AdminContext`, `ShopContext`), which allows independent files.
2.  Or extract them as functions in the same file `App.tsx` (or maybe `App.views.tsx`), but they still rely on the massive closures.

Since the priority is to split `App.tsx`, we will start by abstracting the state to Contexts. Let's do a Context-based refactoring later as it will touch 29k lines of code.

Currently, I have fixed the build issue that was causing the `dev` server to not start. The `dev` server is now working fine. 

For now, is there anything specific you would like me to work on?
