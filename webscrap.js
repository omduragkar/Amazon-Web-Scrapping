console.log("Amazon web Scrapper")
const axios = require('axios');
const jsdom = require("jsdom");
const express = require("express")
const app = express();
const xlsx = require('xlsx');
// const { JSDOM } = jsdom;
const puppeteer = require('puppeteer');
const fs = require('fs');
const { JSDOM } = require('jsdom');
// const { fileURLToPath } = require('url');
// fs.writeFileSync("");
const cors = require('cors');
app.use(cors());
app.use(express.json());
(function chalu(app){
    app.post("/workon", (req, res)=>{
        console.log(req.body);
        let obj = req.body;
        let name = obj.name;
        let rangefrom = obj.rangefrom;
        let rangeto = obj.rangeto;
        let pincode = obj.pincode;
        let mainProduct = [];
        webscrap(name, rangefrom, rangeto, pincode);
        async function webscrap(name, rangefrom, rangeto, pincode){
            const browser = await puppeteer.launch({headless: false});
            const page = await browser.newPage();
            await page.setViewport({width:1200, height: 800 })
            // await page.goto('https://www.amazon.in/');
            await page.goto('https://www.amazon.in/', {
                waitUntil: 'networkidle2',
            });
            
            // Pincode:
            await page.waitForSelector("span#glow-ingress-line2");
            await page.click("span#glow-ingress-line2")
            
            
            // Click on pincode apply tab:
            await page.waitForSelector("input[id='GLUXZipUpdateInput']");
            await page.click("div.a-column.a-span8");
            await page.type("input[id='GLUXZipUpdateInput']", pincode, { delay: 20 });
            await page.click("input[aria-labelledby='GLUXZipUpdate-announce']");
            
            // Applying Search:
            await page.waitForTimeout(4000)
            await page.waitForSelector("input[id='twotabsearchtextbox']");
            await page.type("input[id='twotabsearchtextbox']", name, { delay: 20 });
            await page.waitForSelector("input[id='nav-search-submit-button']");
            await page.click("input[id='nav-search-submit-button']");
            

            // Setting Low and High Price:
            await page.waitForSelector("input[id='low-price']");
            await page.click("input[id='low-price']");
            await page.type("input[id='low-price']", rangefrom, {delay:20});
            await page.waitForSelector("input[id='high-price']");
            await page.click("input[id='high-price']");
            await page.type("input[id='high-price']", rangeto, {delay:20});
            await page.waitForSelector("input[aria-labelledby='a-autoid-1-announce']");
            await page.click("input[aria-labelledby='a-autoid-1-announce']");
            // let ur = [];


            await page.waitForTimeout(2000);
            const links = await page.$$eval("h2.a-size-mini.a-spacing-none.a-color-base.s-line-clamp-2>a", am => am.map(e => (e.href)))
            console.log("Total Top results on amazon based on your product name: " + links.length);
            for(let i=0;i<links.length;i++)
            {
                (async function(){
                    const pages = await browser.newPage();
                    await pages.setViewport({width:1200, height: 800 });
                    pages.setDefaultNavigationTimeout(0);
                    await pages.goto(links[0], {
                        waitUntil: 'networkidle2',
                    })
                    const data = await pages.evaluate(()=>document.querySelector("*").outerHTML);
                    // console.log(data);
                    let dom = new jsdom.JSDOM(data);
                    let document = dom.window.document;
                    let product = {}
                    product.no = mainProduct.length + 1
                    
                    let title = document.title;
                    product.productTitle = title;
                    let origprice,  slashedprice, specs, delivery;
                    
                    if( document.querySelector("span.a-color-secondary.a-text-strike"))
                    {
                        origprice = [];
                        console.log(document.querySelector("span.a-color-secondary.a-text-strike").textContent);
                        
                        origprice = document.querySelector("span.a-color-secondary.a-text-strike").textContent && (typeof document.querySelector("span.a-color-secondary.a-text-strike").textContent == Array);
                        origprice.forEach(element => {
                            let x = element.split("\n");
                            x.forEach(elements => {
                                if(elements.length > 3)
                                {
                                    origprice = elements;
                                } 
                                });
                            })
                        product.boxPrice = origprice;
                    }
                    if( document.querySelectorAll("td.a-span3>span.a-size-base.a-text-bold"))
                    {
                        let br = document.querySelectorAll("td.a-span3>span.a-size-base.a-text-bold");
                        for(let i=0;i<br.length;i++)
                        {
                            if(br[i].textContent == "Brand")
                            {
                                product.brand = document.querySelectorAll("td.a-span9>span")[i].textContent;
                                // break;
                            }
                            
                        }
                    }
                    if(document.querySelector("h5>div>div>span.a-color-price"))
                    {
                        slashedprice = document.querySelector("h5>div>div>span.a-color-price").textContent;
                        slashedprice.forEach(element => {
                            let x = element.split("\n");
                            x.forEach(elements => {
                                if(elements.length > 3)
                                {
                                    slashedprice = elements;
                                } 
                                });
                            })
                        product.offerPrice = slashedprice;
                    }
                    if(document.querySelector("span.a-size-base.a-nowrap>span"))
                    {
                        product.rating= document.querySelector("span.a-size-base.a-nowrap>span").textContent;
                    }
                    if(document.querySelectorAll(".a-unordered-list.a-vertical.a-spacing-mini>li"))
                    {
                        specs = document.querySelectorAll(".a-unordered-list.a-vertical.a-spacing-mini>li");
                        let specarray=[];
                        // let specs = document.querySelector("#feature-bullets>h1").textContent;
                        specs.forEach(element => {
                        let x = element.textContent.split("\n");
                        x.forEach(elements => {
                            if(elements.length > 3)
                            {
                                specarray.push(elements);
                                
                            } 
                            });
                        })
                        product.specification = specarray;
                        
                    }
                    if( document.querySelector("#ddmDeliveryMessage>b"))
                    {
                        
                        delivery = document.querySelector("#ddmDeliveryMessage>b").textContent;
                        product.ShipmentInformation = delivery;
                    }
                    
                    
                    
                    product.productLink = links[i];
                    console.log(product);
                    mainProduct.push(product);
                    await pages.waitForTimeout(6000)
                    await pages.close();                
                })();
            }
            // console.log(mainProduct.length);
            await page.waitForTimeout(180000)
            // await page.waitForTimeout(100000)
            // let prodJSON = JSON.stringify(mainProduct);
            // fs.writeFileSync("products.json", prodJSON, "utf-8");
            // converttoexcel();
            await browser.close();
            res.send(mainProduct);
        }


        function converttoexcel()
        {
            const worksheet = xlsx.utils.json_to_sheet(mainProduct);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, "productsfinal");

            // Generating buffer:
            xlsx.write(workbook, {bookType:'xlsx', type:'buffer'})
            
            // Generating binary:
            xlsx.write(workbook, {bookType:'xlsx', type:'binary'});
            xlsx.writeFile(workbook, "productsfinal.xlsx")

        }
    })

})(app);


app.listen(5000, (err)=>{
    err?console.log(err):console.log("Server started at port: 5000")
})