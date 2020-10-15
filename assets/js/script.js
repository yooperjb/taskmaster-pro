var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(key, arr) {

    // then loop over sub-array (each task in each type)
    arr.forEach(function(task) {
      createTask(task.text, task.date, key);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// make ul list-group sortable
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    //console.log("activate", this);
  },
  deactivate: function(event) {
    //console.log("deactivate", this);
  },
  over: function(event) {
    //console.log("over", event.target);
  },
  out: function(event) {
    //console.log("out", event.target);
  },
  update: function(event) {
    // array to store the task data in
    var tempArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();
      
      var date = $(this)
        .find("span")
        .text()
        .trim();

      // add task data to the temp arrary as an object
      tempArr.push({
        text: text,
        date: date
      });
    });
  
  // trim down list's ID to match object property
  var arrName = $(this)
    .attr("id")
    .replace("list-", "");

  // update array on tasks object and save
  // ex. tasks[toDo][]
  tasks[arrName] = tempArr;
  saveTasks();
  console.log("TempArr : " +tempArr);
  }
});

// make drop zone for removing tasks
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    console.log("drop");
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

// when a task name is clicked - convert to textarea for editing
$(".list-group").on("click", "p", function() {
  var text = $(this)
    .text()
    .trim();

  // create a new textarea element
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

// when user interacts with anything other than textarea change back to p
$(".list-group").on("blur", "textarea", function() {
  // get textarea's current value/text
  var text = $(this)
    .val()
    .trim();
  
  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();
    
  console.log(status, index, text);
  console.log(typeof status, typeof index, typeof text);

  // update tasks object with list item info and saveTasks
  // tasks["toDo"][0].text is undefined - trying to write to object not there. 
  tasks[status][index].text = text;
  saveTasks();

  // recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
});

// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  console.log("Date was clicked: ");
  var date = $(this)
    .text()
    .trim();
  
  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements 
  $(this).replaceWith(dateInput);

  // automatically focus on new element
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("blur", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();
  console.log("date is: ", date);

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  
  console.log("status is: ", status);

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localStorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);
})

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


