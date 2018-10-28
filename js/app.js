// BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allitems: {
            expense:[],
            income :[]
        },
        totals: {
            expense:0,
            income :0
        },

        budget: 0,
        percentage:-1 
    };

    var calculateTotal = function(type){
        var sum = 0 ;
        data.allitems[type].forEach(function(curr,index,array){
            sum += curr.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function(type,des,val){
            var newItem;

            // ID = last ID + 1
            // Create new ID
            if(data.allitems[type].length > 0 ){
                ID = data.allitems[type][data.allitems[type].length - 1].id+1;
            } else {
                ID = 0;
            }
            // Create new  item based on 'inc' or 'exp' type
            if(type==='income'){
                newItem = new Income(ID, des, val);
            }else if(type==='expense'){
                newItem = new Expense(ID, des, val);
            }
            //push it into our data structure
            data.allitems[type].push(newItem);
            //return the new element
            return newItem;
           
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allitems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);
            if (index !== -1 ){
                data.allitems[type].splice(index,1);
            }
        },

        calculateBudget: function() {

            // calculate total income and expenses 
            calculateTotal('expense');
            calculateTotal('income');
            // calculate the budget: income - expenses
            data.budget = data.totals.income - data.totals.expense;
            // calculate the percentage of income that we spent
            if(data.totals.income > 0){
            data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
            }else{
                data.percentage = -1 ;
            }
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalIncome: data.totals.income,
                totalExpense: data.totals.expense,
                percentage: data.percentage
            }
        },

        testing: function() {
            return data.allitems;
        }
    };

})();



// UI CONTROLLER
var UIController = (function(){

    var DOMstrings = {
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container'
    }

    return {
        getInput: function() {
            return {
                 type: document.querySelector(DOMstrings.inputType).value, // will be either income or expense
                 description: document.querySelector(DOMstrings.inputDescription).value,
                 value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type){

            var html, newHtml, element;
            // create HTML string with placeholder text
            if(type === 'income') {
                 element = DOMstrings.incomeContainer;
                 html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix">'+
                '<div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn">'+
                '<i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'expense'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix">'+
                '<div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete">'+
                '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>';
            }
            

            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


            
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function(){
            var fields , fieldsArray ;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArray[0].focus();

        },

        displayBudget: function(obj){
            document.querySelector(DOMstrings.budgetLabel).textContent= obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent= obj.totalIncome;
            document.querySelector(DOMstrings.expenseLabel).textContent= obj.totalExpense;

            if(obj.percentage > 0 ){
                document.querySelector(DOMstrings.percentageLabel).textContent= obj.percentage + '%';
            }else {
                document.querySelector(DOMstrings.percentageLabel).textContent= '--';

            }
        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    };

})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl,UICtrl) {

    var setupEventListeners = function(){

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

    }

    var updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. Display the budget on the UI
        var budget = budgetCtrl.getBudget();
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function() {
        var input, newItem ;
        // 1.Get the field input data
        input = UICtrl.getInput();

        if(input.description !== '' && !isNaN(input.value) && input.value > 0 ){
            // 2.Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            // 4. Clear fields
            UICtrl.clearFields();
            // 5.calculate and update budget
            updateBudget();
        }
   
    }

    var ctrlDeleteItem = function(event) {

        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            //income-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. Update and show the new budget
            updateBudget();
        }
    };

   

    return {
        init: function(){
            UICtrl.displayBudget({budget:0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1});
            setupEventListeners();
        }
    };



})(budgetController,UIController);


controller.init();
