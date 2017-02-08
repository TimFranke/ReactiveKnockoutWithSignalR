// Model Version 2 
/// <reference path="../../Scripts/bootstrap.js" />
var EmployeeViewModel = function () {
    var self = this;

    self.employees = ko.observableArray();
    self.loading = ko.observable(true);

    //  this method goes through each property in the 
    //  employee and registers a callback function for 
    //  all property changes if the key is an observable item.
    self.watchModel = function (model, callback) {
        for (var key in model) {
            if (model.hasOwnProperty(key) && ko.isObservable(model[key])) {
                self.subscribeToProperty(model, key, function (key, val) {
                    callback(model, key, val);
                });
            }
        }
    }
    //  part II of this same functionality
    self.subscribeToProperty = function (model, key, callback) {
        model[key].subscribe(function (val) {
            callback(key, val);
        });
    }

    $.getJSON("api/employee", function (data) {
        // here we change our employee collection
        // Adds & Removes are seen by an observableArray
        // but property changes on an individual item are not.

        // So we'll add each employee as an object with 
        // individual observable properties..that way
        //  We'll now know when the COLLECTION changes AND
        //  Each individual property of the Employee object
        self.employees(ko.utils.arrayMap(data, function (employee) {
            var obsEmployee = {
                Id: employee.Id,
                FirstName: ko.observable(employee.FirstName),
                LastName: ko.observable(employee.LastName),
                Position: ko.observable(employee.Position),
                Salary: ko.observable(employee.Salary),
                TerminationDate: ko.observable(employee.TerminationDate)
            }

            //  Tell the watch mechanism to start watching
            //  all the observable properties on this employee.
            //  When any change, it will automatically call
            //  an event handler we'll set up called modelChanged
            self.watchModel(obsEmployee, self.modelChanged);
            return obsEmployee;
        }));
        self.loading(false);
    });

    //  One of our employees has changed...but just one property
    //  So we'll send the ID, 
    //                the property that changed, 
    //                and the new value
    //  into a JSON object and send it to MVC4 Web Api to update
    self.modelChanged = function (model, key, val) {
        // this is called object literal notation in JavaScript
        var payload = {
            Id: model.Id,
            PropertyName: key,
            PropertyValue: val
        };

        // The greatest method name EVER!
        var str = JSON.stringify(payload);

        // Do the deed
        $.ajax({
            url: 'api/employee/',
            type: 'PUT',
            data: str,
            contentType: 'application/json',
            dataType: 'json'
        });
    }
}

$(function () {
    ko.applyBindings(new EmployeeViewModel);
});
