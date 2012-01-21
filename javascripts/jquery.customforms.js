/*
 * jQuery Custom Forms Plugin 1.0
 * www.ZURB.com
 * Copyright 2010, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/

(function ($) {

  function appendCustomMarkup(type) {
    $('form.custom input:' + type).each(function () {

      var $this = $(this).removeAttr('style').addClass('customized'),
          $span = $this.next('span.custom.' + type);

      if ($span.length === 0) {
        $span = $('<span class="custom ' + type + '"></span>').insertAfter($this);
      }

      $span.toggleClass('checked', $this.is(':checked'))
        .toggleClass('disabled', $this.is(':disabled'));
    });
  }

  function refreshCustomSelect($select, append) {
    var $customSelect = $select.next(append ? 'div.custom.dropdown' : ''),
        $options = $select.find('option'),
        maxWidth = 0,
        outerWidth,
        li = '',
        $ul,
        html;

    if (append && $customSelect.length === 0) {
      $customSelect = $('<div class="custom dropdown"><span href="#" class="selector"></span><ul></ul></div>"');
      $customSelect.prepend('<span href="#" class="current">' + $options.first().html() + '</sapn>');

      $select.removeAttr('style').addClass('customized')
        .after($customSelect);
      
      $ul = $customSelect.find('ul');
    } else {
      $ul = $customSelect.find('ul').html('');
      $customSelect.removeAttr('style');
      $ul.removeAttr('style');  
    }

    if (append) {
      $customSelect.toggleClass('disabled', $select.is(':disabled'));
    }

    $options.each(function () {
      html = $(this).html();
      li += '<li';
      if (this.selected) {
        li += ' class="selected"';
        $customSelect.find('.current').html(html);
      }
      li += '>' + html + '</li>';
    });
    $ul.append(li);

    // fix width
    $customSelect.find('li').each(function () {
      $customSelect.addClass('open');
      outerWidth = $(this).outerWidth();
      if (outerWidth > maxWidth) {
        maxWidth = outerWidth;
      }
      $customSelect.removeClass('open');
    });
    $customSelect.css('width', maxWidth + 18 + 'px');
    $ul.css('width', maxWidth + 16 + 'px');

  }

  $(function () {

    appendCustomMarkup('checkbox');
    appendCustomMarkup('radio');

    $('form.custom select').each(function () {
      refreshCustomSelect($(this), true);
    });

  });

  function toggleCheckbox($element) {
    var $input = $element.prev(),
        input = $input[0];

    if (!$input.is(':disabled')) {
        input.checked = !input.checked;
        $element.toggleClass('checked');

        $input.trigger('change');
    }
  }
  
  function toggleRadio($element) {
    var $input = $element.prev(),
        input = $input[0];

    $('input:radio[name="' + $input.attr('name') + '"]').each(function () {
      $(this).next().removeClass('checked');
    });
    input.checked = !input.checked;
    $element.toggleClass('checked');
    
    $input.trigger('change');
  }
  
  $('form.custom span.custom.checkbox').live('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    
    toggleCheckbox($(this));
  });
  
  $('form.custom span.custom.radio').live('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    
    toggleRadio($(this));
  });

  $('form.custom select').live('change', function (event) {
    refreshCustomSelect($(this));
  });
  
  $('form.custom label').live('click', function (event) {
    var $this = $(this),
        $associatedElement = $('#' + $this.attr('for')),
        spanSelector = 'span.custom.',
        type;
    if ($associatedElement.length !== 0) {
      type = $associatedElement.attr('type');
      if (type === 'checkbox') {
        event.preventDefault();
        toggleCheckbox($this.find(spanSelector + type));
      } else if (type === 'radio') {
        event.preventDefault();
        toggleRadio($this.find(spanSelector + type));
      }
    }
  });

  var $currentDropdown,
      currentPosition = 0,
      focus,
      $document = $(document);

  function dropdownChange ($dropdown, selected) {
    $currentDropdown = $dropdown;
    if ($currentDropdown) {
      $currentDropdown.prev().find('option').each(function (index) {
        if (this.selected) { 
          currentPosition = index;
        }
      });
      if (selected) {
        var $li = $currentDropdown.find('li');
        $li.removeClass('selected');
        $li.eq(currentPosition).addClass('selected');  
      }  
    }
  }

  $('form.custom div.custom.dropdown .current, form.custom div.custom.dropdown .selector').live('click', function (event) {
    var $this = $(this),
        $dropdown = $this.closest('div.custom.dropdown'),
        $select = $dropdown.prev();
    
    event.preventDefault();
    
    if (!$select.is(':disabled')) {
        $dropdown.toggleClass('open');
        if ($dropdown.hasClass('open')) {
          $document.bind('click.customdropdown', function (event) {
            $dropdown.removeClass('open');
            dropdownChange();
            $document.unbind('.customdropdown');
          });
          dropdownChange($dropdown, true)
        } else {
          dropdownChange();
          $document.unbind('.customdropdown');
        }
    }
  });

  function changeFocus(target, focused) {
    var $input = $(target).next().toggleClass('focus', focused);
    if (target.nodeName.toLowerCase() == 'select') {
      dropdownChange(focused && $input);
      focus = focused;
    }
  }

  $('form.custom .customized').live('focus', function (event) {
    changeFocus(this, true);
  });

  $('form.custom .customized').live('blur', function (event) {
    changeFocus(this, false);
  });

  $document.bind('keydown', function (event) {
    if ($currentDropdown) {
      
      var keyCode = event.keyCode,
          $select = $currentDropdown.prev(),
          $li;

      if (event.target.nodeName.toLowerCase() == 'select') {
        $(event.target).find('option').each(function (index) {
          if (this.selected) {
            currentPosition = index;
          }
        });
      } else {
        if ((keyCode == 13 || keyCode == 27) && !focus) { //return & escape
          $currentDropdown.trigger('click.customdropdown');
        } else if (keyCode == 37 || keyCode == 38) { //left & up
          currentPosition--;
        } else if (keyCode == 39 || keyCode == 40) { //right & down
          currentPosition++;
        } else {
          return true;
        }
        event.preventDefault();
      }

      $li = $currentDropdown.find('li');

      if (currentPosition < 0) {
        currentPosition = 0;
      } else if (currentPosition > $li.length - 1) {
        currentPosition = $li.length - 1;
      } else {
        if (!focus) {
          $li.removeClass('selected hover')
            .eq(currentPosition)
            .addClass('selected hover');
        }

        $currentDropdown.find('.current').html($li.eq(currentPosition).html());
        $select[0].selectedIndex = currentPosition;
      }
    }
  });

  $('form.custom div.custom.dropdown li').live('click', function (event) {
    var $this = $(this),
        $customDropdown = $this.closest('div.custom.dropdown'),
        $select = $customDropdown.prev(),
        selectedIndex = 0;
        
    event.preventDefault();
    event.stopPropagation();
    
    $this
      .closest('ul')
      .find('li')
      .removeClass('selected');
    $this.addClass('selected');
    
    $customDropdown
      .removeClass('open')
      .find('a.current')
      .html($this.html());
    
    $this.closest('ul').find('li').each(function (index) {
      if ($this[0] == this) {
        selectedIndex = index;
      }
      
    });
    $select[0].selectedIndex = selectedIndex;
    
    $select.trigger('change');
  });
})(jQuery);