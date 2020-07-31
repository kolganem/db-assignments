'use strict';

/********************************************************************************************
 *                                                                                          *
 * The goal of the task is to get basic knowledge of mongodb functions and                  *
 * approaches to work with data in mongodb. Most of the queries should be implemented with  *
 * aggregation pipelines.                                                                   *
 * https://docs.mongodb.com/manual/reference/aggregation/                                   *
 * https://docs.mongodb.com/manual/reference/operator/aggregation/                          *
 *                                                                                          *
 * The course do not includes basic syntax explanations                                     *
 * Start from scratch can be complex for the tasks, if it's the case, please check          *
 * "MongoDB University". The M001 course starts quite often so you can finish it to get     *
 * the basic understanding.                                                                 *
 * https://university.mongodb.com/courses/M001/about                                        *
 *                                                                                          *
 ********************************************************************************************/

/**
 * The function is to add indexes to optimize your queries.
 * Test timeout is increased to 15sec for the function.
 * */
async function before(db) {
    await db.collection('employees').createIndex({EmployeeID: 1});
    await db.collection('orders').createIndex({OrderID: 1});
    await db.collection('orders').createIndex({CustomerID: 1});
    await db.collection('order-details').createIndex({OrderID: 1});
    await db.collection('order-details').createIndex({ProductID: 1});
    await db.collection('products').createIndex({ProductID: 1});
    await db.collection('products').createIndex({SupplierID: 1});
    await db.collection('products').createIndex({CategoryID: 1});
    await db.collection('customers').createIndex({CustomerID: 1}); 
}

/**
 *  Create a query to return next data ordered by city and then by name:
 * | Employy Id | Employee Full Name | Title | City |
 *
 * NOTES: if City is null - show city as "Unspecified"
 */
async function task_1_1(db) {
    // The first task is example, please follow the style in the next functions.
    const result = await db.collection('employees').aggregate([
        {
            $project: {
                _id: 0,
                EmployeeID: 1,
                "Employee Full Name": { $concat: ["$FirstName", " ", "$LastName"]},
                Title: 1,
                City: { $ifNull: ["$City", "Unspecified"]}
            }
        },
        {$sort: {City: 1, "Employee Full Name": 1}}
    ]).toArray();
    return result;
}

/**
 *  Create a query to return an Order list ordered by order id descending:
 * | Order Id | Order Total Price | Total Order Discount, % |
 *
 * NOTES:
 *  - Discount in OrderDetails is a discount($) per Unit.
 *  - Round all values to MAX 3 decimal places
 */
async function task_1_2(db) {
    const result = await db.collection('order-details').aggregate([
        { 
            $group: {
                _id: "$OrderID",
                "Order Total Price": { $sum: {$multiply: [ "$Quantity", "$UnitPrice" ] } },
                "Qt_Ds" : { $sum: {$multiply: [ "$Quantity", "$Discount" ] } }
            }
        },
        { 
            $project: {
                _id: false,
                "Order Id": "$_id",
                "Order Total Price": { $round:[ "$Order Total Price",3] },
                "Total Order Discount, %": { $round:[{ $divide: [{ $multiply: [100, "$Qt_Ds" ] }, "$Order Total Price"]},3] }
            }
        },
        { $sort: { "Order Id": -1 }}       
    ]).toArray();
    return result;
}

/**
 *  Create a query to return all customers without Fax, order by CustomerID:
 * | CustomerID | CompanyName |
 *
 * HINT: check by string "NULL" values
 */
async function task_1_3(db) {
    const result = await db.collection('customers').aggregate([
        { 
            $match : { 
                Fax : "NULL" , 
            }
        },
        { 
            $project: { 
                _id: false, 
                CustomerID:1, 
                CompanyName:1 
            }
        }
    ]).toArray();
    return result;
}

/**
 * Create a query to return:
 * | Customer Id | Total number of Orders | % of all orders |
 *
 * Order data by % - higher percent at the top, then by CustomerID asc.
 * Round all values to MAX 3 decimal places.
 *
 * HINT: that can done in 2 queries to mongodb.
 *
 */
async function task_1_4(db) {

    let count = await db.collection('orders').countDocuments();

    const result = await db.collection('orders').aggregate([
        {
            $group: {
                _id : "$CustomerID",
                totalOrders : { $sum: 1},
            }
        },
        {
            $project:{
                _id:false,
                "Customer Id" : "$_id",
                "Total number of Orders" : { $round:["$totalOrders", 3]},
                "% of all orders" : { $round:[{ $multiply: [ {$divide: ["$totalOrders", count]}, 100]},3]}
            }
        },
        { $sort: { "% of all orders" : -1, "Customer Id": 1 }}
    ]).toArray();
    return result;
}


/**
 * Return all products where product name starts with 'A', 'B', .... 'F' ordered by name.
 * | ProductID | ProductName | QuantityPerUnit |
 */
async function task_1_5(db) {
    const result = await db.collection('products').aggregate([
        { 
            $match : { 
                ProductName: { $regex: "^[A-F]" } 
            }
        },
        { 
            $project : { 
                _id:false,
                ProductID: 1,
                ProductName: 1,
                QuantityPerUnit: 1
            }
        },
        { $sort:{ ProductName: 1 }}
    ]).toArray();
    return result;
}

/**
 *
 * Create a query to return all products with category and supplier company names:
 * | ProductName | CategoryName | SupplierCompanyName |
 *
 * Order by ProductName then by SupplierCompanyName
 *
 * HINT: see $lookup operator
 *       https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/
 */
async function task_1_6(db) {   
    const result = await db.collection('products').aggregate([
        {
            $lookup: {
                from: "categories", 
                localField: "CategoryID", 
                foreignField: "CategoryID", 
                as: "categor_arr"
            }
        }, 
        { $unwind: "$categor_arr"}, 
        {
            $lookup: {
                from: "suppliers", 
                localField: "SupplierID", 
                foreignField: "SupplierID", 
                as: "supliers_Arr"
            }
        }, 
        { $unwind: "$supliers_Arr" }, 
        {
            $project: {
                _id: false, 
                ProductName: 1, 
                CategoryName: "$categor_arr.CategoryName", 
                SupplierCompanyName: "$supliers_Arr.CompanyName"
            }
        }, 
        { $sort: { ProductName: 1, CategoryName: 1 }}
    ]).toArray();
    return result;
}

/**
 *
 * Create a query to return all employees and full name of person to whom this employee reports to:
 * | EmployeeID | FullName | ReportsTo |
 *
 * Full Name - title of courtesy with full name.
 * Order data by EmployeeID.
 * Reports To - Full name. If the employee does not report to anybody leave "-" in the column.
 */
async function task_1_7(db) {
    const result = await db.collection('employees').aggregate([		
        { 
            $lookup: {		
                from: "employees",		
                localField: "ReportsTo",		
                foreignField: "EmployeeID",		
                as: "ReportsToSomebody"		
            }
        },		
        { $unwind: {path: "$ReportsToSomebody", preserveNullAndEmptyArrays: true}},		
        {
            $project: {
                _id:false,
                EmployeeID: 1,
                FullName: { $concat: [{ $ifNull: ["$TitleOfCourtesy", ""]},{ $ifNull: ["$FirstName", ""]}, " ", { $ifNull: ["$LastName", ""]}] },
                ReportsTo: { $ifNull: [ {$concat: ["$ReportsToSomebody.FirstName"," ", "$ReportsToSomebody.LastName"]}, "-" ]}
            }   
        },
        { $sort:{ EmployeeID: 1 }}
    ]).toArray();
    return result;
}

/**
 *
 * Create a query to return:
 * | CategoryName | TotalNumberOfProducts |
 * Order by CategoryName
 */
async function task_1_8(db) {
    const result = await db.collection('categories').aggregate([
        { 
            $lookup: {
                from: "products",
                localField: "CategoryID",
                foreignField: "CategoryID",
                as: "ProductsArr"
            }
        },
        { 
            $project: {
                _id: false,
                CategoryName: 1,
                TotalNumberOfProducts: { $size: "$ProductsArr" }
            }
        },
        { $sort:{ CategoryName: 1 }}
    ]).toArray();
    return result;
}

/**
 *
 * Create a query to find those customers whose contact name containing the 1st character is 'F' and the 4th character is 'n' and rests may be any character.
 * | CustomerID | ContactName |
 * order by CustomerID
 */
async function task_1_9(db) {
    const result = await db.collection('customers').aggregate([
        { 
            $match:{ 
                ContactName : { $regex: "^F[a-z][a-z]n" }
            } 
        },
        { 
            $project: {
                _id: false,
                CustomerID: 1,
                ContactName: 1
            }
        },
        { $sort:{ CustomerID: 1 }}
    ]).toArray();
    return result;
}

/**
 * Write a query to get discontinued Product list:
 * | ProductID | ProductName |
 * order by ProductID
 */
async function task_1_10(db) {
    const result = await db.collection('products').aggregate([
        { 
            $match:{ 
                Discontinued : 1 
            }
        },
        { 
            $project: {
                _id: false,
                ProductID: 1,
                ProductName: 1
            }
        },
        { $sort:{ ProductID: 1 }}
    ]).toArray();
    return result;
}

/**
 * Create a query to get Product list (name, unit price) where products cost between $5 and $15:
 * | ProductName | UnitPrice |
 *
 * Order by UnitPrice then by ProductName
 */
async function task_1_11(db) {
    const result = await db.collection('products').aggregate([
        { 
            $match:{ 
                UnitPrice :{ $gte: 5, $lte: 15 } 
            }
        },
        { 
            $project: {
                _id: false,
                ProductName: 1,
                UnitPrice: 1
            }
        },
        { $sort:{ UnitPrice: 1,  ProductName:1 }}
    ]).toArray();
    return result;
}

/**
 * Write a SQL query to get Product list of twenty most expensive products:
 * | ProductName | UnitPrice |
 *
 * Order products by price (asc) then by ProductName.
 */
async function task_1_12(db) {
    const result = await db.collection('products').aggregate([
        { $sort: { UnitPrice: -1 }},
        { $limit : 20 },
        { 
            $project: {
                _id: false,
                ProductName:1,
                UnitPrice:1
            }
        },
        { $sort: { UnitPrice: 1, ProductName: 1 }},
    ]).toArray();
    return result;
}

/**
 * Create a query to count current and discontinued products:
 * | TotalOfCurrentProducts | TotalOfDiscontinuedProducts |
 *
 * HINT: That's acceptable to make it in 2 queries
 */
async function task_1_13(db) {

     const result = await db.collection('products').aggregate([
    { 
        $group: {
            _id: false,
            TotalOfCurrentProducts: { $sum: 1},
            TotalOfDiscontinuedProducts: { $sum: { $cond: [{ $eq: [ "$Discontinued", 1 ] },1,0] }}
        }
    },
    { 
        $project: {
            _id:false,
            TotalOfCurrentProducts: 1,
            TotalOfDiscontinuedProducts: 1
        }
    }
    ]).toArray();       
    return result[0];
    //throw new Error("Not implemented");
}


/**
 * Create a query to get Product list of stock is less than the quantity on order:
 * | ProductName | UnitsOnOrder| UnitsInStock |
 * Order by ProductName
 *
 * HINT: see $expr operator
 *       https://docs.mongodb.com/manual/reference/operator/query/expr/#op._S_expr
 */
async function task_1_14(db) {
    const result = await db.collection('products').aggregate([
        { 
            $match : { 
                $expr : { $gt : ["$UnitsOnOrder" , "$UnitsInStock" ]  } 
            } 
        },
        { 
            $project: {
                _id:false,
                ProductName: 1,
                UnitsOnOrder: 1,
                UnitsInStock: 1,
            }
        },
        { $sort: { ProductName: 1,}}
    ]).toArray();
    return result;
}

/**
 * Create a query to return the total number of orders for every month in 1997 year:
 * | January | February | March | April | May | June | July | August | September | November | December |
 *
 * HINT: see $dateFromString
 *       https://docs.mongodb.com/manual/reference/operator/aggregation/dateFromString/
 */
async function task_1_15(db) {
   
    const result = await db.collection('orders').aggregate([
        {   
            $match: { 
                OrderDate: {$gte: "1997-01-01", $lt: "1998-01-01" } 
            } 
        },
        { 
            // just to save space did it in the one line
            $group: { 
                _id: false,
                January: { $sum: { $cond: [ { $eq: [ { $month: { $dateFromString: { dateString:"$OrderDate"}} }, 1 ] }, 1, 0 ] } },
                February: { $sum: { $cond: [ { $eq: [ { $month: { $dateFromString: { dateString:"$OrderDate"}} }, 2 ] }, 1, 0 ] } },
                March: { $sum: { $cond: [ { $eq: [ { $month: { $dateFromString: { dateString:"$OrderDate"}} }, 3 ] }, 1, 0 ] } },
                April: { $sum: { $cond: [ { $eq: [ { $month: { $dateFromString: { dateString:"$OrderDate"}} }, 4 ] }, 1, 0 ] } },
                May: { $sum: { $cond: [ { $eq: [ { $month: { $dateFromString: { dateString:"$OrderDate"}} }, 5 ] }, 1, 0 ] } },
                June: { $sum: { $cond: [ { $eq: [ { $month: { $dateFromString: { dateString:"$OrderDate"}} }, 6 ] }, 1, 0 ] } },
                July: { $sum: { $cond: [ { $eq: [ { $month: { $dateFromString: { dateString:"$OrderDate"}} }, 7 ] }, 1, 0 ] } },
                August: { $sum: { $cond: [ { $eq: [ { $month: { $dateFromString: { dateString:"$OrderDate"}} }, 8 ] }, 1, 0 ] } },
                September: { $sum: { $cond: [ { $eq: [ { $month: { $dateFromString: { dateString:"$OrderDate"}} }, 9 ] }, 1, 0 ] } },
                October: { $sum: { $cond: [ { $eq: [ { $month: { $dateFromString: { dateString:"$OrderDate"}} }, 10 ] }, 1, 0 ] } },
                November: { $sum: { $cond: [ { $eq: [ { $month: { $dateFromString: { dateString:"$OrderDate"}} }, 11 ] }, 1, 0 ] } },
                December: { $sum: { $cond: [ { $eq: [ { $month: { $dateFromString: { dateString:"$OrderDate"}} }, 12 ] }, 1, 0 ] } }, 
        }},
        { $project: {
            _id: false,
            January:1,
            February:1,
            March:1,
            April:1,
            May:1,
            June:1,
            July:1,
            August:1,
            September:1,
            October:1,
            November:1,
            December:1
        }}
    ]).toArray();
    return result[0];

}

/**
 * Create a query to return all orders where ship postal code is provided:
 * | OrderID | CustomerID | ShipCountry |
 * Order by OrderID
 */
async function task_1_16(db) {
    const result = await db.collection('orders').aggregate([
        { 
            $match: { 
                ShipPostalCode: { $ne: null } 
            }
        },
        { 
            $project: {
                _id:false,
                OrderID: 1,
                CustomerID: 1,
                ShipCountry: 1            
            }
        },
        {$sort:{OrderID:1}}
    ]).toArray();
    return result;
}

/**
 * Create SQL query to display the average price of each categories's products:
 * | CategoryName | AvgPrice |
 * Order by AvgPrice descending then by CategoryName
 * NOTES:
 *  - Round AvgPrice to MAX 2 decimal places
 */
async function task_1_17(db) {
    const result = await db.collection('products').aggregate([
        { 
            $group: { 
                _id: "$CategoryID",
                AvgPrice: { $avg: "$UnitPrice" }
            }
        },
        { 
            $lookup: {
                from: "categories",
                let: { categorId: "$_id"},
                pipeline: [
                    { $match: { $expr: { $eq: ["$CategoryID", "$$categorId"] } } },
                    { $project: { _id:0, CategoryName: 1 } }
                ],
                as: "categor_Arr"
            }
        },
        { $unwind:"$categor_Arr" },
        { 
            $project:{
                _id:false,
                CategoryName: "$categor_Arr.CategoryName",
                AvgPrice: { $round:["$AvgPrice",2]}
            }
        },
        {$sort:{AvgPrice:-1, CategoryName:1}}
    ]).toArray();
    return result;
}

/**
 * Create a query to calcualte total orders count by each day in 1998:
 * | OrderDate | Total Number of Orders |
 *
 * Order Date needs to be in the format '%Y-%m-%d'
 * Order by OrderDate
 *
 * HINT: see $dateFromString, $dateToString
 *       https://docs.mongodb.com/manual/reference/operator/aggregation/dateToString/
 *       https://docs.mongodb.com/manual/reference/operator/aggregation/dateFromString/
 */
async function task_1_18(db) {
    
    const result = await db.collection('orders').aggregate([
        { 
            $match: { 
                OrderDate: {$gte: "1998-01-01", $lt: "1999-01-01" } 
            } 
        },
        { 
            $group: {
                _id: { 
                    "Date": {$dateFromString: { dateString: "$OrderDate"}}
                }, 
                "Total Number of Orders": { $sum: 1 }
            }
        },
        { $sort: { _id: 1 }},
        { $project: {
                _id:false,
                "Order Date": {$dateToString:{ date:"$_id.Date", format:"%Y-%m-%d" }},
                "Total Number of Orders": "$Total Number of Orders"                       
            }
        }
    ]).toArray();
    return result;
}

/**
 * Create a query to display customer details whose total orders amount is more than 10000$:
 * | CustomerID | CompanyName | TotalOrdersAmount, $ |
 *
 * Order by "TotalOrdersAmount, $" descending then by CustomerID
 *  NOTES:
 *  - Round TotalOrdersAmount to MAX 2 decimal places
 *
 *  HINT: the query can be slow, you need to optimize it and pass in 2 seconds
 *       - https://docs.mongodb.com/manual/tutorial/analyze-query-plan/
 *       - quite often you can solve performance issues just with adding PROJECTIONS.
 *         *** Use Projections to Return Only Necessary Data ***
 *         https://docs.mongodb.com/manual/tutorial/optimize-query-performance-with-indexes-and-projections/#use-projections-to-return-only-necessary-data
 *       - do not hesitate to "ensureIndex" in "before" function at the top if needed https://docs.mongodb.com/manual/reference/method/db.collection.ensureIndex/
 */
async function task_1_19(db) {

    const result = await db.collection('customers').aggregate([
        {
            $lookup: {
                from: "orders",
                  localField: "CustomerID",
                  foreignField: "CustomerID",
                  as: "cust_Arr"
                }
           },
           {$unwind:"$cust_Arr"},
        
           {
                $lookup:{
                    from: "order-details",
                    localField: "cust_Arr.OrderID",
                    foreignField: "OrderID",
                    as: "ord_det_Arr"
                }
           },
           {$unwind:"$ord_det_Arr"},
           {
               $group: { 
                    _id: {"C_ID":"$CustomerID","C_N":"$CompanyName"},
                    "T_O_A": { $sum:{ $multiply:["$ord_det_Arr.UnitPrice","$ord_det_Arr.Quantity"]}}
                }
            },
           { $match:{"T_O_A":{$gt:10000}}},
           {
               $project:{
                    "_id":false,
                    "CustomerID":"$_id.C_ID",
                    "CompanyName":"$_id.C_N",
                    "TotalOrdersAmount, $": {$round:["$T_O_A", 2]}
                }
            },
           {$sort: { "TotalOrdersAmount, $": -1, "CustomerID":1}}
        ]).toArray();
    return result;
}

/**
 *
 * Create a query to find the employee that sold products for the largest amount:
 * | EmployeeID | Employee Full Name | Amount, $ |
 */
async function task_1_20(db) {
    const result = await db.collection('employees').aggregate([
        {
            $lookup:
            {
                from: "orders",
                localField: "EmployeeID",
                foreignField: "EmployeeID",
                as: "orders_Arr"
            }
        },
        { $unwind: "$orders_Arr" },
        {
            $lookup:
            {
                from: "order-details",
                localField: "orders_Arr.OrderID",
                foreignField: "OrderID",
                as: "order_details_Arr"
            }
        },
        { $unwind: "$order_details_Arr" },
        { 
            $group: 
            { 
                _id: { EmployeeID: "$EmployeeID", FullName: { $concat: ["$FirstName", " ", "$LastName"] } }, 
                "Amount, $": { $sum: { $multiply: [ "$order_details_Arr.UnitPrice", "$order_details_Arr.Quantity" ] } }
            } 
        },
        {
            $project:{
                _id:false,
                "EmployeeID": "$_id.EmployeeID",
                "Employee Full Name": "$_id.FullName",
                "Amount, $": 1
            }
        },
        { $sort: { "Amount, $": -1 } },
        { $limit: 1 }
    ]).toArray();
    return result;
}

/**
 * Write a SQL statement to get the maximum purchase amount of all the orders.
 * | OrderID | Maximum Purchase Amount, $ |
 */
async function task_1_21(db) {
    const result = await db.collection('order-details').aggregate([
        { 
            $group: { 
                _id: "$OrderID",
                "Maximum Purchase Amount, $": { $sum: { $multiply: [ "$UnitPrice", "$Quantity" ] } }
            }
        },
        { $sort: { "Maximum Purchase Amount, $": -1 } },
        { $limit: 1 },
        { 
            $project: {
                _id:false,
                "OrderID" : "$_id",
                "Maximum Purchase Amount, $" : "$Maximum Purchase Amount, $"
            }
        }
    ]).toArray();
    return result;
}

/**
 * Create a query to display the name of each customer along with their most expensive purchased product:
 * CustomerID | CompanyName | ProductName | PricePerItem |
 *
 * order by PricePerItem descending and them by CompanyName and ProductName acceding
 *
 * HINT: you can use pipeline inside of #lookup
 *       https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/#join-conditions-and-uncorrelated-sub-queries
 */
async function task_1_22(db) {
    const result = await db.collection('orders').aggregate([
        {
            $lookup: {
                from: "order-details",               
                localField: "OrderID",
                foreignField: "OrderID",
                as: "details_Arr"
            }
        },
        { $unwind: "$details_Arr" },
        { $sort: { "details_Arr.UnitPrice": -1 } },
        {
            $group: {
                _id: "$CustomerID", 
                product: { $first: "$details_Arr.ProductID" },
                MaxPrice: { $max: "$details_Arr.UnitPrice" }
            }
        },
        {
            $lookup: {
                from: "customers",               
                localField: "_id",
                foreignField: "CustomerID",
                as: "customers_Arr",
            }
        },
        { $unwind: "$customers_Arr" },
        {
            $lookup: {
                from: "products",               
                localField: "product",
                foreignField: "ProductID",
                as: "products_Arr"
            }
        },
        { $unwind: "$products_Arr" },
        {
            $project: {
                _id: 0,
                CustomerID: "$_id",
                ProductName: "$products_Arr.ProductName",
                CompanyName: "$customers_Arr.CompanyName",
                "PricePerItem": "$MaxPrice"
            }
        },
        { $sort: { "PricePerItem": -1, CompanyName: 1, ProductName: 1 } }
    ]).toArray();
    return result;    
}

module.exports = {
    before: before,
    task_1_1: task_1_1,
    task_1_2: task_1_2,
    task_1_3: task_1_3,
    task_1_4: task_1_4,
    task_1_5: task_1_5,
    task_1_6: task_1_6,
    task_1_7: task_1_7,
    task_1_8: task_1_8,
    task_1_9: task_1_9,
    task_1_10: task_1_10,
    task_1_11: task_1_11,
    task_1_12: task_1_12,
    task_1_13: task_1_13,
    task_1_14: task_1_14,
    task_1_15: task_1_15,
    task_1_16: task_1_16,
    task_1_17: task_1_17,
    task_1_18: task_1_18,
    task_1_19: task_1_19,
    task_1_20: task_1_20,
    task_1_21: task_1_21,
    task_1_22: task_1_22
};
