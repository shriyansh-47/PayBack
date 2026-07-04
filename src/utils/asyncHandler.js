
// Using try-catch
// const asyncHandler = (fn) => {
//     // asyncHandler returna s function which is the handler function that we'd have written in the main
//     // index.js file but instead we wrapped it in asyncHandler to prevent repetitive try-catch
//     return async (req,res,next) => {
//             try {
//                 await fn(req,res,next)
//             } catch (error) {
//                 res.status(error.code || 500).json(
//                     {
//                         success: false,
//                         message: error.message
//                     }
//                 )
//             }
//     }
// }

// Using promises
const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((error)=>{
            next(error)
        })
    }
}

export {asyncHandler}


/********************************************************************
 *                        asyncHandler
 ********************************************************************/

/*
1. What is asyncHandler?

A helper function that wraps async controllers.

Its purpose is to automatically catch errors so you don't
have to write try...catch in every controller.
*/


/*
2. Why do we need it?

Without asyncHandler:

const getUsers = async(req,res)=>{
    try{
        const users = await User.find();
        res.json(users);
    }
    catch(error){
        res.status(500).json({
            message: error.message
        });
    }
}

Every controller needs the same try...catch.
*/


/*
3. With asyncHandler

const getUsers = asyncHandler(async(req,res)=>{
    const users = await User.find();
    res.json(users);
});

Cleaner and less repetitive.
*/


/*
4. How does it work?

Your controller

        │
        ▼
asyncHandler(controller)
        │
        ▼
Creates a NEW function

async(req,res,next)=>{
    try{
        await controller(req,res,next)
    }
    catch(error){
        // Handle error
    }
}
*/


/*
5. Does asyncHandler replace my controller?

No.

It WRAPS your controller.

Your controller still executes normally.

asyncHandler only adds automatic error handling around it.
*/


/*
6. What is fn?

const asyncHandler = (fn)=>{ ... }

fn is simply the controller you pass.

Example:

asyncHandler(getUsers)

Here,

fn === getUsers
*/


/*
7. What does await fn(req,res,next) mean?

It simply executes your controller.

If

fn = getUsers

then

await fn(req,res,next)

becomes

await getUsers(req,res,next)
*/


/*
8. Request Flow

Request
   │
   ▼
asyncHandler
   │
   ▼
Controller
   │
   ├── Success
   │       │
   │       ▼
   │   Send Response
   │
   └── Error
           │
           ▼
   asyncHandler catches it
*/


/*
9. Why keep it inside utils/ ?

Because it is a reusable helper function.

Many controllers use it, so instead of copying
the same code everywhere, we write it once
inside utils/.
*/


/*
10. One-line definition

asyncHandler is a higher-order function that
takes an async controller, wraps it inside
a try...catch, and returns a new controller
with automatic error handling.
*/