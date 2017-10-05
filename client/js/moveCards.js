var dragSrcEl = null;
var cards = document.querySelectorAll('.card');

function handleDragStart(e) {
    this.style.opacity = '0.4';  // this / e.target is the source node.
  
  dragSrcEl = this;

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text', this.innerHTML);
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
  }

  e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

  return false;
}

function handleDragEnter(e) {
  // this / e.target is the current hover target.
  this.classList.add('over');
}

function handleDragLeave(e) {
  this.classList.remove('over');  // this / e.target is previous target element.
}

function handleDrop(e) {
  if(e.preventDefault) { e.preventDefault(); }
  if (e.stopPropagation) {
    e.stopPropagation(); // Stops some browsers from redirecting.
  }

  // Don't do anything if dropping the same column we're dragging.
  if (dragSrcEl != this) {
    // Set the source column's HTML to the HTML of the column we dropped on.
    mySound.set("/sounds/moveCards.mp3")
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer.getData('text');
    
     this.style.opacity = "1";
      dragSrcEl.style.opacity = "1";
  }
  
  return false;
}

function handleDragEnd(e) {
   dragSrcEl.style.opacity = "1";
     // this / e.target is the source node.
  // this/e.target is the source node.



  [].forEach.call(cards, function (card) {
    card.classList.remove('over');
  });
}


[].forEach.call(cards, function(card) {
  card.addEventListener('dragstart', handleDragStart, false);
  card.addEventListener('dragenter', handleDragEnter, false)
  card.addEventListener('dragover', handleDragOver, false);
  card.addEventListener('dragleave', handleDragLeave, false);
  card.addEventListener('drop', handleDrop, false);
  card.addEventListener('dragend', handleDragEnd, false);
});


selects = document.getElementsByClassName("select");
 
[].forEach.call(selects, function(s) {
   s.addEventListener("click", loginTables)
   });
