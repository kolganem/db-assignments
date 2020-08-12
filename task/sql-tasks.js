'use strict';

/********************************************************************************************
 *                                                                                          *
 * The goal of the task is to get basic knowledge of SQL functions and                      *
 * approaches to work with data in SQL.                                                     *
 * https://dev.mysql.com/doc/refman/5.7/en/function-reference.html                          *
 *                                                                                          *
 * The course do not includes basic syntax explanations. If you see the SQL first time,     *
 * you can find explanation and some trainings at W3S                                       *
 * https://www.w3schools.com/sql/sql_syntax.asp                                             *
 *                                                                                          *
 ********************************************************************************************/


/**
 *  Create a SQL query to return next data ordered by city and then by name:
 * | Employy Id | Employee Full Name | Title | City |
 *
 * @return {array}
 *
 */
async function task_1_1(db) {
    // The first task is example, please follow the style in the next functions.
    let result = await db.query(`
        SELECT
           EmployeeID as "Employee Id",
           CONCAT(FirstName, ' ', LastName) AS "Employee Full Name",
           Title as "Title",
           City as "City"
        FROM Employees
        ORDER BY City, "Employee Full Name"
    `);
    return result[0];
}

/**
 *  Create a query to return an Order list ordered by order id descending:
 * | Order Id | Order Total Price | Total Order Discount, % |
 *
 * NOTES: Discount in OrderDetails is a discount($) per Unit.
 * @return {array}
 *
 */
async function task_1_2(db) {
    let result = await db.query(`
    SELECT
        OrderID AS "Order Id",
        SUM(Quantity*UnitPrice) AS "Order Total Price",
        ROUND(SUM(Quantity*Discount)/SUM(Quantity*UnitPrice)*100,3) AS "Total Order Discount, %"        
    FROM OrderDetails
    GROUP BY OrderID
    ORDER BY OrderID DESC;
    `); 
    return result[0];
}

/**
 *  Create a query to return all customers from USA without Fax:
 * | CustomerId | CompanyName |
 *
 * @return {array}
 *
 */
async function task_1_3(db) {
    let result = await db.query(`
    SELECT 
        CustomerID AS CustomerId,
        CompanyName AS CompanyName
    FROM Customers
    Where Country = 'USA' AND Fax IS NULL;
`);
return result[0];
}

/**
 * Create a query to return:
 * | Customer Id | Total number of Orders | % of all orders |
 *
 * order data by % - higher percent at the top, then by CustomerID asc
 *
 * @return {array}
 *
 */
async function task_1_4(db) {
    let result = await db.query(`
    SELECT 
        CustomerID AS "Customer Id",
        COUNT(CustomerID) AS "Total number of Orders",
        ROUND(COUNT(OrderID)*100/SUM(count(OrderID)) OVER(),5) AS "% of all orders"
    FROM Orders
    GROUP BY CustomerID
    ORDER BY \`% of all orders\` DESC, CustomerID;
    `);
    return result[0];
}

/**
 * Return all products where product name starts with 'A', 'Bs', .... 'F' ordered by name.
 * | ProductId | ProductName | QuantityPerUnit |
 *
 * @return {array}
 *
 */
async function task_1_5(db) {
    let result = await db.query(`
    SELECT 
        ProductID AS "ProductId",
        ProductName AS "ProductName",
        QuantityPerUnit AS "QuantityPerUnit"
    FROM Products
    WHERE ProductName REGEXP '^[A-F]'
    ORDER BY ProductName;
    `);
    return result[0];
}

/**
 *
 * Create a query to return all products with category and supplier company names:
 * | ProductName | CategoryName | SupplierCompanyName |
 *
 * Order by ProductName then by SupplierCompanyName
 * @return {array}
 *
 */
async function task_1_6(db) {
    let result = await db.query(`
    SELECT 
	ProductName,
        categories.CategoryName AS "CategoryName",
        suppliers.CompanyName AS "SupplierCompanyName"
    FROM Products 
    JOIN categories ON products.CategoryID = categories.CategoryID 
    JOIN suppliers ON suppliers.SupplierID = products.SupplierID 
    ORDER BY ProductName, 'SupplierCompanyName';
    `);
    return result[0];
}

/**
 *
 * Create a query to return all employees and full name of person to whom this employee reports to:
 * | EmployeeId | FullName | ReportsTo |
 *
 * Full Name - title of courtesy with full name.
 * Order data by EmployeeId.
 * Reports To - Full name. If the employee does not report to anybody leave "-" in the column.
 * @return {array}
 *
 */
async function task_1_7(db) {
    let result = await db.query(`
    SELECT 
        empl.EmployeeID AS "EmployeeId",
        CONCAT(empl.FirstName, ' ', empl.LastName) AS "FullName",
        IFNULL(CONCAT(repToCol.FirstName, ' ', repToCol.LastName), '-') AS "ReportsTo"
    FROM Employees empl 
    LEFT JOIN Employees repToCol ON empl.ReportsTo = repToCol.EmployeeID;
    `);
    return result[0];
}

/**
 *
 * Create a query to return:
 * | CategoryName | TotalNumberOfProducts |
 *
 * @return {array}
 *
 */
async function task_1_8(db) {
    let result = await db.query(`
    SELECT 
        CategoryName as "CategoryName",
        COUNT(fromProd.ProductID) AS "TotalNumberOfProducts"
    FROM Categories categ
    LEFT JOIN Products fromProd ON categ.categoryID = fromProd.categoryID
    GROUP BY categ.categoryID
    ORDER BY CategoryName;
    `);
    return result[0];
}

/**
 *
 * Create a SQL query to find those customers whose contact name containing the 1st character is 'F' and the 4th character is 'n' and rests may be any character.
 * | CustomerID | ContactName |
 *
 * @return {array}
 *
 */
async function task_1_9(db) {
    let result = await db.query(`
    SELECT 
        CustomerID,
        ContactName
    FROM Customers
    WHERE ContactName regexp'^[F][a-z][a-z][n]';    
    `);
    return result[0];
}

/**
 * Write a query to get discontinued Product list:
 * | ProductID | ProductName |
 *
 * @return {array}
 *
 */
async function task_1_10(db) {
    let result = await db.query(`
    SELECT 
        ProductID,
        ProductName
    FROM Products
    WHERE Discontinued = 1;    
    `);
    return result[0];
}

/**
 * Create a SQL query to get Product list (name, unit price) where products cost between $5 and $15:
 * | ProductName | UnitPrice |
 *
 * Order by UnitPrice then by ProductName
 *
 * @return {array}
 *
 */
async function task_1_11(db) {
    let result = await db.query(`
    SELECT 
        ProductName,
        UnitPrice
    FROM Products
    WHERE UnitPrice >= 5 AND UnitPrice <= 15
    ORDER BY UnitPrice, ProductName; 
    `);
    return result[0];
}

/**
 * Write a SQL query to get Product list of twenty most expensive products:
 * | ProductName | UnitPrice |
 *
 * Order products by price then by ProductName.
 *
 * @return {array}
 *
 */
async function task_1_12(db) {
    // Why function TOP isn't supported ? Surprise :(
    let result = await db.query(`
   SELECT 
        ProductName, UnitPrice
    FROM 
        (SELECT 
            ProductName, UnitPrice
        FROM
            Products
        ORDER BY UnitPrice DESC
        LIMIT 20) AS prod
    ORDER BY UnitPrice, ProductName;
    `);
    return result[0];
}

/**
 * Create a SQL query to count current and discontinued products:
 * | TotalOfCurrentProducts | TotalOfDiscontinuedProducts |
 *
 * @return {array}
 *
 */
async function task_1_13(db) {
    let result = await db.query(`
   SELECT
        (SELECT COUNT() FROM Products WHERE Discontinued = 1) AS 'TotalOfDiscontinuedProducts',
        (SELECT COUNT() FROM Products) AS 'TotalOfCurrentProducts';
    `);
    return result[0];
}

/**
 * Create a SQL query to get Product list of stock is less than the quantity on order:
 * | ProductName | UnitsInOrder| UnitsInStock |
 *
 * @return {array}
 *
 */
async function task_1_14(db) {
    let result = await db.query(`
    SELECT 
        ProductName,
        UnitsOnOrder,
        UnitsInStock
    FROM Products
    Where UnitsInStock < UnitsOnOrder;
    `);
    return result[0];
}

/**
 * Create a SQL query to return the total number of orders for every month in 1997 year:
 * | January | February | March | April | May | June | July | August | September | November | December |
 *
 * @return {array}
 *
 */
async function task_1_15(db) {
    let result = await db.query(`
    SELECT 
        COUNT(IF(MONTH(OrderDate) = 1, 1, NULL)) AS "January",
        COUNT(IF(MONTH(OrderDate) = 2, 1, NULL)) AS "February",
        COUNT(IF(MONTH(OrderDate) = 3, 1, NULL)) AS "March",
        COUNT(IF(MONTH(OrderDate) = 4, 1, NULL)) AS "April",
        COUNT(IF(MONTH(OrderDate) = 5, 1, NULL)) AS "May",
        COUNT(IF(MONTH(OrderDate) = 6, 1, NULL)) AS "June",
        COUNT(IF(MONTH(OrderDate) = 7, 1, NULL)) AS "July",
        COUNT(IF(MONTH(OrderDate) = 8, 1, NULL)) AS "August",
        COUNT(IF(MONTH(OrderDate) = 9, 1, NULL)) AS "September",
        COUNT(IF(MONTH(OrderDate) = 10, 1, NULL)) AS "October",
        COUNT(IF(MONTH(OrderDate) = 11, 1, NULL)) AS "November",
        COUNT(IF(MONTH(OrderDate) = 12, 1, NULL)) AS "December"
    FROM Orders
    WHERE YEAR(OrderDate) = 1997;
    `);
    return result[0];
}

/**
 * Create a SQL query to return all orders where ship postal code is provided:
 * | OrderID | CustomerID | ShipCountry |
 *
 * @return {array}
 *
 */
async function task_1_16(db) {
    let result = await db.query(`
    SELECT 
        OrderID,
        CustomerID,
        ShipCountry
    FROM Orders
    WHERE ShipPostalCode IS NOT NULL;
    `);
    return result[0];
}

/**
 * Create SQL query to display the average price of each categories's products:
 * | CategoryName | AvgPrice |
 *
 * @return {array}
 *
 * Order by AvgPrice descending then by CategoryName
 *
 */
async function task_1_17(db) {
    let result = await db.query(`
    SELECT 
        CategoryName AS "CategoryName",
        AVG(Products.UnitPrice) AS "AvgPrice"
    FROM Categories
    LEFT JOIN Products ON Categories.CategoryID = Products.CategoryID
    GROUP BY Categories.CategoryID
    ORDER BY AvgPrice DESC, CategoryName;
    `);
    return result[0];
}

/**
 * Create a SQL query to calcualte total orders count by each day in 1998:
 * | OrderDate | Total Number of Orders |
 *
 * Order Date needs to be in the format '%Y-%m-%d %T'
 * @return {array}
 *
 */
async function task_1_18(db) {
    let result = await db.query(`
    SELECT 
        date_format(OrderDate, '%Y-%m-%d %T') AS "OrderDate",
        COUNT(OrderID) AS "Total Number of Orders"
    FROM Orders
    WHERE YEAR(OrderDate) = 1998 
    GROUP BY OrderDate
    ORDER BY OrderDate;
    `);
    return result[0];
}

/**
 * Create a SQL query to display customer details whose total orders amount is more than 10000$:
 * | CustomerID | CompanyName | TotalOrdersAmount, $ |
 *
 * Order by "TotalOrdersAmount, $" descending then by CustomerID
 * @return {array}
 *
 */
async function task_1_19(db) {
    let result = await db.query(`
    SELECT 
        Orders.CustomerID AS "CustomerID",
        Customers.CompanyName AS "CompanyName",
        SUM(UnitPrice * Quantity) AS "TotalOrdersAmount, $"
    FROM OrderDetails
    JOIN Orders ON OrderDetails.OrderID = Orders.OrderID
    JOIN Customers ON Orders.CustomerID = Customers.CustomerID
    GROUP BY Orders.CustomerID
    HAVING \`TotalOrdersAmount, $\` > 10000
    ORDER BY \`TotalOrdersAmount, $\` DESC, \`CustomerID\`
    `);
    return result[0];
}

/**
 *
 * Create a SQL query to find the employee that sold products for the largest amount:
 * | EmployeeID | Employee Full Name | Amount, $ |
 *
 * @return {array}
 *
 */
async function task_1_20(db) {
    let result = await db.query(`
    SELECT 
        Orders.EmployeeID,
        CONCAT(Employees.FirstName,' ',Employees.LastName) AS 'Employee Full Name',
        SUM(OrderDetails.UnitPrice * OrderDetails.Quantity) AS 'Amount, $'
    FROM Orders
    JOIN Employees ON Orders.EmployeeID = Employees.EmployeeID
    JOIN OrderDetails ON Orders.OrderID = OrderDetails.OrderID
    GROUP BY Employees.EmployeeID
    ORDER BY \`Amount, $\` DESC
    LIMIT 1;
    `);
    return result[0];
}

/**
 * Write a SQL statement to get the maximum purchase amount of all the orders.
 * | OrderID | Maximum Purchase Amount, $ |
 *
 * @return {array}
 */
async function task_1_21(db) {
    let result = await db.query(`
    SELECT
        OrderID,
        SUM(Quantity * UnitPrice) AS "Maximum Purchase Amount, $"
    FROM OrderDetails
    GROUP BY OrderID
    ORDER BY \`Maximum Purchase Amount, $\` DESC
    LIMIT 1;
    `);
    return result[0];
}

/**
 * Create a SQL query to display the name of each customer along with their most expensive purchased product:
 * | CompanyName | ProductName | PricePerItem |
 *
 * order by PricePerItem descending and them by CompanyName and ProductName acceding
 * @return {array}
 */
async function task_1_22(db) {
    let result = await db.query(`
    SELECT
        cust.CompanyName,
        prod.ProductName as "ProductName",
        ord_det.UnitPrice as "PricePerItem"        
    FROM Customers AS cust
    JOIN Orders AS ord ON ord.CustomerID = cust.CustomerID
    JOIN OrderDetails AS ord_det ON ord_det.OrderID = ord.OrderID
    JOIN Products AS prod ON prod.ProductID = ord_det.ProductID
    WHERE ord_det.UnitPrice = (
        SELECT MAX(ord_det_tmp.UnitPrice)
        FROM Customers AS cust_tmp
        JOIN Orders AS ord_tmp ON ord_tmp.CustomerID = cust_tmp.CustomerID
        JOIN OrderDetails AS ord_det_tmp ON ord_tmp.OrderID = ord_det_tmp.OrderID
        WHERE cust.CustomerID = cust_tmp.CustomerID
    )
    GROUP BY PricePerItem, CompanyName, ProductName
    ORDER BY PricePerItem desc, CompanyName, ProductName;
    `);
    return result[0];
}


module.exports = {
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
