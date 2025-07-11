var thwvsf_base = (function($, window, document) {
	'use strict';	
	
	function escapeHTML(html) {
	   var fn = function(tag) {
		   var charsToReplace = {
			   '&': '&amp;',
			   '<': '&lt;',
			   '>': '&gt;',
			   '"': '&#34;'
		   };
		   return charsToReplace[tag] || tag;
	   }
	   return html.replace(/[&<>"]/g, fn);
	}
	 	 
	function isHtmlIdValid(id) {
		//var re = /^[a-z]+[a-z0-9\_]*$/;
		var re = /^[a-z\_]+[a-z0-9\_]*$/;
		return re.test(id.trim());
	}
	
	function isValidHexColor(value) {      
		if ( preg_match( '/^#[a-f0-9]{6}$/i', value ) ) { // if user insert a HEX color with #     
			return true;
		}     
		return false;
	}
	
	function setup_tiptip_tooltips(){
		var tiptip_args = {
			'attribute': 'data-tip',
			'fadeIn': 50,
			'fadeOut': 50,
			'delay': 200
		};

		$('.tips').tipTip( tiptip_args );
	}
	
	function setup_color_picker(form) {
	 	
 		var i = 0;
        form.find(".thpladmin-colorpick").iris({

            change: function(event, ui) {

                $(this).parent().find(".thpladmin-colorpickpreview").css({
                    backgroundColor: ui.color.toString()
                })
                
            },
            hide: !0,
            border: !0
        }).click(function() {
        	if($(this).closest(".thwvsf_settings_fields_form").length  > 0){
        		$(".iris-picker").hide(), $(this).closest(".thwvsf_settings_fields_form").find(".iris-picker").show()
        	}else{
        		  $(".iris-picker").hide(), $(this).closest("td").find(".iris-picker").show()
        	}
          
           
        }), $("body").click(function() {
            $(".iris-picker").hide()
        }), $(".thpladmin-colorpick").click(function(event) {
            event.stopPropagation()
        })
        i++;
    }

	
	function setup_popup_tabs(form, selector_prefix){
		$("."+selector_prefix+"-tabs-menu a").click(function(event) {
			event.preventDefault();
			$(this).parent().addClass("current");
			$(this).parent().siblings().removeClass("current");
			var tab = $(this).attr("href");
			$("."+selector_prefix+"-tab-content").not(tab).css("display", "none");
			$(tab).fadeIn();
		});
	}
	
	function open_form_tab(elm, tab_id, form_type){
		var tabs_container = $("#thwvsf-tabs-container_"+form_type);
		
		$(elm).parent().addClass("current");
		$(elm).parent().siblings().removeClass("current");
		var tab = $("#"+tab_id+"_"+form_type);
		tabs_container.find(".thpladmin-tab-content").not(tab).css("display", "none");
		$(tab).fadeIn();
	}
	
	function prepare_field_order_indexes(elm) {
		$(elm+" tbody tr").each(function(index, el){
			$('input.f_order', el).val( parseInt( $(el).index(elm+" tbody tr") ) );
		});
	}

	
	function get_property_field_value(form, type, name){
		var value = '';
		
		switch(type) {
			case 'select':
				value = form.find("select[name=i_"+name+"]").val();
				value = value == null ? '' : value;
				break;
				
			case 'checkbox':
				value = form.find("input[name=i_"+name+"]").prop('checked');
				value = value ? 1 : 0;
				break;
				
			default:
				value = form.find("input[name=i_"+name+"]").val();
				value = value == null ? '' : value;
		}	
		
		return value;
	}
	
		
	function set_property_field_value(form, type, name, value, multiple){
		
		switch(type) {
			case 'select':
				if(multiple == 1 && typeof(value) === 'string'){
					value = value.split(",");
					name = name+"[]";
				}
				form.find('select[name="i_'+name+'"]').val(value);
				break;
				
			case 'checkbox':
				value = value == 'yes' || value == 1 ? true : false;
				form.find("input[name=i_"+name+"]").prop('checked', value);
				break;

			case 'colorpicker':

				form.find("input[name=i_"+name+"]").val(value);
				form.find('span.'+name+'_preview').css('background-color',value);
				break;

			case 'radio' : 

				form.find("input[name=i_"+name+"]").val(value);
				form.find($('.'+value)).addClass('rad-selected').siblings('.rad-selected').removeClass('rad-selected');
				break;

			default:
				form.find("input[name=i_"+name+"]").val(value);
		}	
	}

	var active_tab = 0;
	function setup_form_side_popup(){

		$('.pp_nav_tabs > li').click(function(){
			var index = $(this).data('index');
			var popup = $(this).closest('.popup-wrapper');
			open_tab(popup, $(this), index);
			active_tab = index;
		});
	}

	function open_tab(popup, link, index){
		var panel = popup.find('.data_panel_'+index);

		close_all_data_panel(popup);
		link.addClass('active');
		panel.css("display", "block");
	}

	
	function close_all_data_panel(popup){

		popup.find('.pp_nav_tabs > li').removeClass('active');

		popup.find('.data-panel').css("display", "none");

		popup.find('.global-tabs > li').removeClass('active');
	}
		
	return {
		escapeHTML : escapeHTML,
		isHtmlIdValid : isHtmlIdValid,
		isValidHexColor : isValidHexColor,
		setup_tiptip_tooltips : setup_tiptip_tooltips,
		setupColorPicker : setup_color_picker,
		setupPopupTabs : setup_popup_tabs,
		openFormTab : open_form_tab,
		get_property_field_value : get_property_field_value,
		set_property_field_value : set_property_field_value,
		setup_form_side_popup : setup_form_side_popup,
   	};
}(window.jQuery, window, document));


function thwvsOpenFormTab(elm,tab_id, form_type){
    thwvsf_base.openFormTab(elm, tab_id, form_type)
}
var thwvsf_settings = (function($, window, document) {
   
    'use strict';
    var mediaUploader;
  
    var MSG_INVALID_NAME = 'NAME/ID must begin with a lowercase letter ([a-z]) and may be followed by any number of lowercase letters, digits ([0-9]) and underscores ("_")';
      
    /*------------------------------------
    *---- ON-LOAD FUNCTIONS - SATRT ----- 
    *------------------------------------*/

    $(document).ready(function(e){
		var feature_popup = $(".thwvsf-pro-discount-popup");
	    var feature_popup_wrapper = $(".thwvsf-pro-discount-popup-wrapper");

	    if (feature_popup.length > 0) {
	    	$('body').css('overflow','hidden');
	        feature_popup[0].style.display = "flex";
	    }
	});

    $(function() {

        var settings_div = $('#edittag'),
          add_tag_div = $('#addtag'),
          advanced_settings_div = $('#advanced_settings_form'),
          custom_attr_div = $('.thwvsf-custom-table'),
          design_settings_div = $('#thwvs_design_form');

        thwvsf_base.setupColorPicker(advanced_settings_div);
        thwvsf_base.setupColorPicker(settings_div);
        thwvsf_base.setupColorPicker(add_tag_div);
        thwvsf_base.setupColorPicker(custom_attr_div);
        thwvsf_base.setupColorPicker(design_settings_div);

        var tabs_wrapper = $('.thwvsadmin-wrapper');
        var last_active_tab = $('#last_active_tab').val();

        thwvsf_base.setup_form_side_popup();
        $('.th-swatch-option-link').closest('#col-container').addClass('th-attr-container');
    });


    function upload_icon_image(elm, e){
        
        mediaUploader = wp.media.frames.file_frame = wp.media({
            title: 'Choose Image',
            button: {
            text: 'Choose Image'
        },  multiple: false });
        // When a file is selected, grab the URL and set it as the text field's value
        var $image_div =  $(elm).parents('.thwvsf-upload-image'),
            $index_media_image = $image_div.find('.i_index_media_img'),
            $index_media = $image_div.find('.i_index_media'),
            $remove_button = $image_div.find('.thwvsf_remove_image_button');
        
        mediaUploader.on('select', function() {
            var attachment = mediaUploader.state().get('selection').first().toJSON();      
            $index_media_image.attr('src', attachment.url);
            $index_media.val(attachment.id);
            $('.thwvsf_remove_uploaded').show();
            $remove_button.show();

        });

        mediaUploader.open();
    }

    var placeholder = thwvsf_var.placeholder_image;

    function remove_icon_image(elm,e){
        var $image_div =  $(elm).parents('.thwvsf-upload-image'),
            $index_media_image = $image_div.find('.i_index_media_img'),
            $index_media = $image_div.find('.i_index_media'),
            $remove_button = $image_div.find('.thwvsf_remove_image_button');

        $index_media_image.attr( 'src',placeholder);
        $index_media.val( '' );
        $remove_button.hide();
        return false;
    }

    function change_term_type(elm,e){
        var type = $(elm).val(),
            form = $(elm).closest('.thwvsf_custom_attribute');

        var custom_attr_div = $('.thwvsf-custom-table');
        thwvsf_base.setupColorPicker(custom_attr_div);

        if(type == 'select'){
            form.find($(".thwvsf-custom-table")).hide();
        }else{
            form.find($(".thwvsf-custom-table")).hide();
            form.find($(".thwvsf-custom-table-"+ type)).show();
            form.find($(".th-tooltip-row")).show();
        }

        if(type == 'select'){
            form.find($(".th-tooltip-row")).hide();
        }else{
            form.find($(".th-tooltip-row")).show();
        }
    }

    function open_term_body(elm, e){
        var element = $(elm);
        var parent = $(elm).closest('td');
        var parent_table = $(elm).closest('table');

        if(!element.hasClass('open')){
            parent_table.find('.thwvsf-local-body').hide();
            parent.find('.thwvsf-local-body').show('slow');

            parent_table.find('.thwvsf-local-head').removeClass('open');
            element.addClass('open');
        }else{
            element.removeClass('open');
            parent.find('.thwvsf-local-body').hide();
        }
    }

    var DESIGN_FORM_FIELDS = {

        design_name : {name : 'design_name', label : ' Design Name', type : 'text', value : ''},

        icon_height : {name : 'icon_height',  type : 'text', value : '45px'},
        icon_width  : {name : 'icon_height',  type : 'text', value : '45px'},
        icon_shape  : {name : 'icon_shape',type : 'select', value : '0px'},

        icon_label_height : {name : 'icon_height',  type : 'text', value : '45px'},
        icon_label_width  : {name : 'icon_height',  type : 'text', value : 'auto'},
        label_size             : {name : 'label_size', type : 'text', value : '16px'},
        label_background_color : {name : 'label_background_color', type : 'colorpicker', value :'#fff'},
        label_text_color       : {name : 'label_text_color', type : 'colorpicker', value :'#000'},

        icon_border_color    : {name : 'icon_border_color', type : 'colorpicker', value :'#d1d7da'},
        icon_border_color_hover    : {name : 'icon_border_color_hover', type : 'colorpicker', value :'#aaaaaa'},
        icon_border_color_selected : {name : 'icon_border_color_selected', type : 'colorpicker', value :'#827d7d'},

        common_selection_style           : {name : 'common_selection_style', type : 'select', value :'border'},
        tick_color                       : {name : 'tick_color', type : 'colorpicker', value :'#ffffff'},
        tick_size                        : {name : 'tick_size', type : 'text', value :'15px'},
        label_selection_style            : {name : 'label_selection_style', type : 'select', value :'border'},
        label_background_color_hover     : {name : 'label_background_color_hover', type : 'colorpicker', value :'#ffffff'},
        label_text_color_hover           : {name : 'label_text_color_hover', type : 'colorpicker', value :'#000000'},
        label_background_color_selection : {name : 'label_background_color_selection', type : 'colorpicker', value :'#000000'},
        label_text_color_selection       : {name : 'label_text_color_selection', type : 'colorpicker', value :'#ffffff'},
        label_tick_color                 : {name : 'label_tick_color', type : 'colorpicker', value :'#000000'},
        label_tick_size                  : {name : 'label_tick_size', type : 'text', value :'15px'},
        enable_swatch_dropdown           : {name : 'enable_swatch_dropdown', type : 'checkbox', value :0},

        tooltip_enable                : {name : 'tooltip_enable', type : 'checkbox', value :0},
        tooltip_text_background_color : {name : 'tooltip_text_background_color', type : 'colorpicker', value :'#000000'},
        tooltip_text_color            : {name : 'tooltip_text_color', type : 'colorpicker', value :'#ffffff'},  

    };


    $( document ).ajaxComplete( function( event, request, options ) {
        if ( request && 4 === request.readyState && 200 === request.status
        && options.data && 0 <= options.data.indexOf( 'action=add-tag' ) ) {

            var res = wpAjax.parseAjaxResponse( request.responseXML, 'ajax-response' );
            if ( ! res || res.errors ) {
                return;
            }
            // Clear Thumbnail fields on submit
            $('.i_index_media_img' ).attr( 'src', placeholder);
            $('.i_index_media').val('');
            $('#product_cat_thumbnail_id' ).val( '' );
            $('.thwvsf_remove_image_button' ).hide();
            $('.thwvsf_settings_fields_form').find('.thpladmin-colorpickpreview').css('background-color','');
            return;
        }

        if ( request && 4 === request.readyState && 200 === request.status
        && options.data && 0 <= options.data.indexOf( 'action=woocommerce_save_attributes' ) ) {
            var this_page = window.location.toString();
            this_page = this_page.replace( 'post-new.php?', 'post.php?post=' + woocommerce_admin_meta_boxes.post_id + '&action=edit&' );
            var custom_attr_div = $('.thwvs-custom-table');

            $('#thwvs-product-attribute-settings').load(this_page+' #custom_variations_inner',function(){
                $('#thwvs-product-attribute-settings').trigger( 'reload' );
                thwvsf_base.setupColorPicker($('.th-custom-attr-color-td'));
                $('#thwvs-product-attribute-settings').trigger('init_tooltips');
            });
        }

    });

    function open_attribute_form(elm, id, design_type){

        var form = $('#thwvs_attribute_form_pp');
        open_design_popup(elm, form);

         var terms_json = $(elm).data('terms');

        var type = terms_json['type'],
            name = terms_json['name'],
            label     = terms_json['label'];

        form.find('.attr-label').text(label);
        thwvsf_base.set_property_field_value(form, "hidden", "attr_id",id, 0);
        thwvsf_base.set_property_field_value(form,"text", "label",label, 0);
        thwvsf_base.set_property_field_value(form,"text", "name",name, 0);
        thwvsf_base.set_property_field_value(form,"select","type", type, 0); 
        thwvsf_base.set_property_field_value(form, "select", "swatch_design_style", design_type, 0); 

        populate_attribute_term_fields(form, terms_json, id, type);
        thwvsf_base.setupColorPicker(form);
    }

    function populate_attribute_term_fields(form, terms_json, id, attr_type) {
 
        attr_type = attr_type === 'image_with_label' ? 'image' : attr_type;
        var terms = terms_json['terms'];
        
        populate_color_swatch_terms_html(terms, form);
        populate_label_swatch_terms_html(terms, form);
        populate_image_swatch_terms_html(terms, form);

        form.find(".thwvs_attribute_terms_settings").hide();
        form.find("#thwvs_attribute_terms_"+attr_type).show();
    }
    function swatch_type_change_listener(elm){
        var type         = $(elm).val(),
            form         = $('#thwvs_attribute_form');
        form.find(".thwvs_attribute_terms_settings").hide();
        form.find("#thwvs_attribute_terms_"+type).show();
    }

    function populate_color_swatch_terms_html(terms, form){
        var termHtml = '';
        termHtml += '<tr><td class="terms-label" colspan="3">Set Term Colors</td> </tr>';
        jQuery.each(terms,function(key,value){

            termHtml += '<tr>';
            termHtml += '<td class="titledesc" style="width:35%">'+value['term_name']+'</td>';
            termHtml += '<td style="width: 26px; padding:0px;"></td>';
            
            termHtml += '<td class ="forminp inp-color">';
            termHtml += '<input type="text" name="i_single_color_'+value['slug']+'" value="'+value['color']+'" style="width: 260px;" class="thpladmin-colorpick"/>';
            termHtml += '<span class="thwvs-admin-colorpickpreview thpladmin-colorpickpreview '+value['slug']+'_preview"  style="background-color:'+value['color']+'"></span>';
            termHtml += '</td>';
            termHtml += '</tr>'

        });
        var termTable = form.find("#thwvs_attribute_terms_color");
        termTable.html(termHtml ); 
    }

    function populate_image_swatch_terms_html(terms, form){

        var termHtml = '';
        var placeholder_image = thwvsf_var.placeholder_image,
            upload_img        = thwvsf_var.upload_image,
            remove_img        = thwvsf_var.remove_image;

        termHtml += '<tr><td class="terms-label" colspan="3">Set Term Images</td> </tr>';
        jQuery.each(terms,function(key,value){

            var remove_icon_style = value['image'] ? '' : 'display:none;' ,
             image = value['image'] ? value['image'] : placeholder_image;
          
            termHtml += '<tr>';
            termHtml += '<td class="titledesc" style="width:35%">'+value['term_name']+'</td>';
            termHtml += '<td style="width: 26px; padding:0px;"></td>';
            termHtml += '<td>';
            termHtml += '<div class = "thwvsf-upload-image"> <div class="tawcvs-term-image-thumbnail" style="float:left;margin-right:10px;">';
            termHtml += '<img  class="i_index_media_img" src="'+image+'" width="60px" height="60px" alt="term-image" />';
            termHtml += '</div>';
            termHtml += '<div style="line-height:30px;">';
            termHtml += '<input type="hidden" class="i_index_media"  name= "i_product_image_'+value['slug']+'" value="'+value['term_value']+'">';
            termHtml += '<button type="button" class="thwvs-upload-image-button button " onclick="thwvsf_upload_icon_image(this,event)">';
            termHtml += '<img class="thwvsf-upload-button" src="'+upload_img+'" alt="upload"></button>';                                   
            termHtml += '<button type="button" style ="'+remove_icon_style+'"  class="thwvsf_remove_image_button button " onclick="thwvsf_remove_icon_image(this,event)">';                               
            termHtml += '<img class="thwvsf-remove-button" src="'+remove_img+'" alt="remove"></button>';
            termHtml += '</div>';
            termHtml += '</div>';
            termHtml += '</td>';
            termHtml += '</tr>';

        });
        var termTable = form.find("#thwvs_attribute_terms_image");
        termTable.html(termHtml ); 
    }

    function populate_label_swatch_terms_html(terms, form){
        var termHtml = '';
        termHtml += '<tr><td class="terms-label" colspan="3">Set Term Labels</td> </tr>';
        jQuery.each(terms,function(key,value){
          
            termHtml += '<tr>';
            termHtml += '<td class="titledesc" style="width:35%">'+value['term_name']+'</td>';
            termHtml += '<td style="width: 26px; padding:0px;"></td>';
            termHtml += '<td class ="forminp">';
            termHtml += '<input type="text" name="i_label_'+value['slug']+'" value="'+value['label']+'" style="width: 260px;" />';
            termHtml += '</td>';
            termHtml += '</tr>'

        });
        termHtml += '</div>';
        var termTable = form.find("#thwvs_attribute_terms_label");
        termTable.html(termHtml );
    }

    function edit_design_form(elm, design_styles, design_id, des_title){

        open_design_form('edit', design_styles, design_id, elm, des_title);
    }

    function open_design_form(type, valueJson, design_id, elm, des_title ){

        des_title = $('<div/>').html(des_title).text();

        var container = $('#thwvs_design_form_pp'),
            form = $('#thwvs_design_form');

        populate_design_form(form,type, valueJson, container, des_title );
        form.find("input[name=thwvsf_design_id]").val(design_id);

        open_design_popup(elm, container);
        form.find("input[name=i_design_name]").val(des_title);
    }

    function populate_design_form(form, type, valueJson, container, des_title){

        

        var title = (type === 'edit' &&  des_title) ? des_title : 'New Design Style';

        container.find('.pp-title').text(title);
        if(type === 'new'){

            set_form_field_values(form, DESIGN_FORM_FIELDS, false);
        }else{

            set_form_field_values(form, DESIGN_FORM_FIELDS, valueJson);
        }
    }


    function set_form_field_values(form, fields, valuesJson){

        var sname = valuesJson && valuesJson['name'] ? valuesJson['name'] : '';
        
        $.each( fields, function( name, field ) {
            var type     = field['type'],                                 
                value    = valuesJson && valuesJson[name] ? valuesJson[name] : field['value'],
                multiple = field['multiple'] ? field['multiple'] : 0;

            if(type === 'checkbox'){
                if(!valuesJson && field['checked']){
                    value = field['checked'];
                }
            }
            name = name;

            thwvsf_base.set_property_field_value(form, type, name, value, multiple);
        });


        form.find("select[name=i_attr_selection_style]").change();
        form.find("select[name=i_common_selection_style]").change();
        form.find("select[name=i_label_selection_style]").change();
    }

    function open_design_popup(elm, popup){

        //var popup = $("#thwvs_design_form_pp");

        if ($('.popup-wrapper').hasClass('dismiss')) {

           $('.popup-wrapper').removeClass('dismiss').addClass('selected').show();
        }

        $('.thwvs-template-preview-wrapper .thwvs-template-box').removeClass('design-active');

        $('.thwvs-design-templates.thwvs-template-popup').addClass('pop-active');
        $('.product_page_th_product_variation_swatches_for_woocommerce').addClass('thwvs-body-deactive');

        $(elm).closest('.thwvs-template-box').addClass('design-active');
        popup.find('ul.pp_nav_tabs li').first().click();
    }

    function close_design_popup(elm){
        if ($('.popup-wrapper').hasClass('selected')) {
            
            $('.popup-wrapper').removeClass('selected').addClass('dismiss');
        }

        $('.thwvs-design-templates.thwvs-template-popup').removeClass('pop-active');
        $('.product_page_th_product_variation_swatches_for_woocommerce').removeClass('thwvs-body-deactive');
        $('.thwvs-template-preview-wrapper .thwvs-template-box').removeClass('design-active');
    }

    function trigger_attribute_tab(elm){
        $('ul.wc-tabs .attribute_options.attribute_tab a').trigger('click');
    }

    $( document ).on( 'click', '.thpladmin-notice .notice-dismiss', function() {
        var wrapper = $(this).closest('div.thpladmin-notice');
        var nonce   = wrapper.data("nonce");
       
        var data = {
            thwvsf_review_nonce: nonce,
            action: 'dismiss_thwvsf_review_request_notice',
        };
        $.post( ajaxurl, data, function() {

        });
    });

    function show_check_styles(elm){

        var sel_type = $(elm).val(),
            tick_style = $('.tick_prop');

        if(sel_type == 'border_with_tick'){
            tick_style.show();
        }else{
            tick_style.hide();
        }
    }

    function label_selection_syles(elm){
        var sel_lab_type = $(elm).val(),
            lab_back_elm = $('.label_background_prop'),
            lab_tick_elm = $('.label_tick_prop');

        if(sel_lab_type == 'border_with_tick'){
            lab_back_elm.hide();
            lab_tick_elm.show();
        }else if(sel_lab_type == 'background_color'){
            lab_tick_elm.hide();
            lab_back_elm.show();
        }else{
            lab_tick_elm.hide();
            lab_back_elm.hide();
        }
    }

    function widget_popup(){

        var x = document.getElementById("myDIV"),
            y = document.getElementById("myWidget"),
            th_animation=document.getElementById("th_quick_border_animation"),
            th_arrow = document.getElementById("th_arrow_head");

        if (x.style.display === "none" || !x.style.display) {
            x.style.display = "block";
            th_arrow.style="transform:rotate(-12.5deg);";
            th_animation.style="box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);";
            th_animation.style.animation='none';
        } else {
            x.style.display = "none";
            th_arrow.style="transform:rotate(45deg);"
            th_animation.style.animation='pulse 1.5s infinite';
        }
    }

    function widget_close(){

        var z = document.getElementById("myDIV"),
            za = document.getElementById("myWidget"),
            th_animation=document.getElementById("th_quick_border_animation"),
            th_arrow = document.getElementById("th_arrow_head");
        z.style.display = "none";
        th_arrow.style="transform:rotate(45deg);"
        th_animation.style.animation='pulse 1.5s infinite';
    }

    /*------------------------------------
    *---- Pro tab - SATRT ----- 
    *------------------------------------*/

    var slideIndex = 1;
	var count = 0;
	var myTimer;
	var contentTimer;
	var slideshowContainer;

	window.addEventListener("load",function() {
		showSlides(slideIndex);
	    myTimer = setInterval(function(){plusSlides(1)}, 3000);
	    slideshowContainer = document.getElementsByClassName('th-user-review-section')[0];
	    if(slideshowContainer){
	    	slideshowContainer.addEventListener('mouseenter', pause)
		    slideshowContainer.addEventListener('mouseleave', resume)
			slideContent(count);
			contentTimer = setInterval(function(){ contentchange(1)},3000);
	    }
	})

	function pause() {
	  	clearInterval(myTimer);
	  	clearInterval(contentTimer)
	};

	function resume(){
		clearInterval(myTimer);
	  	clearInterval(contentTimer)
	  	myTimer = setInterval(function(){plusSlides(slideIndex)}, 3000);
	  	contentTimer = setInterval(function(){ contentchange(count)},3000);
	};

	function showSlides(n){
		var i;		  
	  	var dots = document.getElementsByClassName("th-review-nav-btn");
	  	
	  	if(dots.length>0){
	  		if (n > dots.length) {
	  			slideIndex = 1
	  		}
			for (i = 0; i < dots.length; i++) {
				dots[i].className = dots[i].className.replace(" active", "");
			}
	  		dots[slideIndex-1].className += " active";	
	  	}
	}

	function plusSlides(n){
		clearInterval(myTimer);
		if (n < 0){
			showSlides(slideIndex -= 1);
		} else {
			showSlides(slideIndex += 1); 
		}
		if (n === -1){
			myTimer = setInterval(function(){plusSlides(n + 2)}, 3000);
		} else {
			myTimer = setInterval(function(){plusSlides(n + 1)}, 3000);
		}
	}

	function accordionexpand(elm){
		var curr_panel = elm.getElementsByClassName("th-panel")[0];
		var accordion_qstn = elm.getElementsByClassName("th-accordion-qstn")[0];
		var accordion_qstn_img = elm.getElementsByClassName("th-accordion-img")[0];
		var accordion_qstn_img_opn = elm.getElementsByClassName("th-accordion-img-opn")[0];
		var accordion_qstn_para = accordion_qstn.querySelector('p');
		var panel = document.getElementsByClassName("th-panel");
		var i;
		for(i = 0; i < panel.length; i++){
			if (curr_panel != panel[i]) {
				if(panel[i].style.display === "block"){
					var parentaccordion = panel[i].parentNode;
					var parent_accordion_qstn = parentaccordion.getElementsByClassName("th-accordion-qstn")[0];
					var parent_accordion_img = parentaccordion.getElementsByClassName("th-accordion-img")[0];
					var parent_accordion_img_opn = parentaccordion.getElementsByClassName("th-accordion-img-opn")[0];
					var parent_accordion_qstn_p = parent_accordion_qstn.querySelector('p');
					panel[i].style.display = "none";
					parent_accordion_qstn_p.style.color = "#121933";
					parentaccordion.style.zIndex = "unset";
					parentaccordion.style.borderColor = "#dfdfdf";
					parent_accordion_qstn.style.marginTop = "0px";
					parent_accordion_img.style.display = "block";
					parent_accordion_img_opn.style.display = "none";
				}
			}
		}
		if (curr_panel.style.display === "block") {
			curr_panel.style.display = "none";
			accordion_qstn_para.style.color = "#121933";
			elm.style.zIndex = "unset";
			accordion_qstn.style.marginTop = "0";
			elm.style.borderColor = "#dfdfdf";
			accordion_qstn_img.style.display = "block";
			accordion_qstn_img_opn.style.display = "none";
		} else {
			curr_panel.style.display = "block";
			accordion_qstn_para.style.color = "#6E55FF";
			elm.style.zIndex = "1";
			elm.style.borderColor = "#6E55FF";
			accordion_qstn.style.marginTop = "1.53rem";
			accordion_qstn_img.style.display = "none";
			accordion_qstn_img_opn.style.display = "block";
		}
	}

	function slideContent(n){
		var review_heading = ['Excellent plugin, and fantastic support','Reliable plug-in and great support', 'Great plugin, super helpful Support', 'Useful plugin for variation swatches','Easy to use and reliable'];
		var headingContainer = document.getElementsByClassName('th-review-heading');
		var review_content = ['This is an excellent plugin.<br>It did everything I needed.<br>And when I needed help, I was able to count on a fantastic support team.<br>Excellent reception.<br>Very worth the investment.',
			'This is a plug-in for using extra product options in your Woocommerce shop. I’m using it for more than a year now with several sites and we’ve never had a single problem or bug.While buying and recently I’ve had a couple of questions, that were answered on the spot, so we’re very satisfied. Keep up the great work!',
			'The pro version of the plugin is just what I needed, and Support was very thorough in answering my questions',
			'I found this plugin the most useful among other ones, because: It has 5 different swatches types like color/bio color, Image, Image with label, text/label/button, and radio. It has swatches display styles that makes it possible to display many swatches in Horizontal scroll, vertical scroll, accordion, dropdown, and slider. The possibility to create links for variations Affordable Price for pro version Fantastic support team for solving problems and customizations Creating unlimited designs for variation swatches Creating custom designs for each variation Compatibility with other plugins',
			'Thank you, ThemeHigh, for this delightful and easy to use plugin when you need just that small something extra.',
		];
		var contentContainer = document.getElementsByClassName('th-review-content');
		var review_author = ['Guilherme Souza','resultancy','Kazerniel','Reza Manouchehri','tigmewp'];
		var authorContainer = document.getElementsByClassName('th-review-user-name');
		if(n > review_heading.length - 1){
			count = 0;
		}
		headingContainer[0].innerHTML =  review_heading[count];
		contentContainer[0].innerHTML = review_content[count];
		authorContainer[0].innerHTML = review_author[count];
	}

	function contentchange(n){
		clearInterval(contentTimer);
	  	if(n<0){
	  		slideContent(count -= 1);
	  	}else{
	  		slideContent(count += 1);
	  	}
	  	if (n === -1){
		    contentTimer = setInterval(function(){ contentchange(1)},3000);
		} else {
		    contentTimer = setInterval(function(){ contentchange(1)},3000);
		}
	}

	function plusSlides(n){
		clearInterval(myTimer);
		if (n < 0){
			showSlides(slideIndex -= 1);
		} else {
			showSlides(slideIndex += 1); 
		}
		if (n === -1){
			myTimer = setInterval(function(){plusSlides(n + 2)}, 3000);
		} else {
			myTimer = setInterval(function(){plusSlides(n + 1)}, 3000);
		}
	}

	function currentSlide(n){
		clearInterval(myTimer);
		myTimer = setInterval(function(){plusSlides(n + 1)}, 3000);
		showSlides(slideIndex = n);
		clearInterval(contentTimer);
		contentTimer = setInterval(function(){ contentchange(n+1)},3000);
		slideContent(count = n);
	}


    return{

        upload_icon_image : upload_icon_image, 
        remove_icon_image : remove_icon_image,
        change_term_type  : change_term_type,
        open_term_body    : open_term_body,

        EditDesignForm    :  edit_design_form,
        CloseDesignPopup  : close_design_popup,
        TriggerAttributeTab : trigger_attribute_tab,
        OpenAttributeForm   : open_attribute_form,
        SwatchTypeChangeListner : swatch_type_change_listener,
        show_check_styles     : show_check_styles,
        label_selection_syles : label_selection_syles,

        thwvsfwidgetPopUp : widget_popup,
        thwvsfwidgetClose : widget_close,

        thwvsfAccordionexpand : accordionexpand,
        currentSlide : currentSlide,
    };

}(window.jQuery, window, document));  

function thwvsf_upload_icon_image(elm,e){
    thwvsf_settings.upload_icon_image(elm,e);
}
function thwvsf_remove_icon_image(elm,e){
    thwvsf_settings.remove_icon_image(elm,e);
}
function thwvsf_change_term_type(elm,e){
    thwvsf_settings.change_term_type(elm,e);
}
function thwvsf_open_body(elm,e){
    thwvsf_settings.open_term_body(elm,e);
}
function thwvsfEditDesignForm(elm, design_styles, design_id, des_title){
    thwvsf_settings.EditDesignForm(elm, design_styles, design_id, des_title);
}
function thwvsfCloseDesignPopup(elm){
    thwvsf_settings.CloseDesignPopup(elm);
}

function thwvsfTriggerAttributeTab(elm){
    thwvsf_settings.TriggerAttributeTab(elm);
}
function thwvsfOpenAttributeForm(elm, id, design_type){
    thwvsf_settings.OpenAttributeForm(elm, id, design_type);
}
function thwvsfSwatchTypeChangeListner(elm){
    thwvsf_settings.SwatchTypeChangeListner(elm);
}
function thwvsfShowcheckStyles(elm){
    thwvsf_settings.show_check_styles(elm);
}
function thwvsfShowLabelSelectionStyles(elm){
    thwvsf_settings.label_selection_syles(elm);
}
function thwvsfwidgetPopUp(){
    thwvsf_settings.thwvsfwidgetPopUp();
}
function thwvsfwidgetClose() {
    thwvsf_settings.thwvsfwidgetClose();
}

function thwvsfAccordionexpand(elm){
	thwvsf_settings.thwvsfAccordionexpand(elm);
}
function currentSlide(elm) {
	thwvsf_settings.currentSlide(elm);
}




jQuery( function( $ ) {

	'use strict';

	var _extends = Object.assign || function (target) {
 		for (var i = 1; i < arguments.length; i++) {
  			var source = arguments[i]; for (var key in source) {
	   			if (Object.prototype.hasOwnProperty.call(source, key)) {
	    			target[key] = source[key]; 
	    		} 
	    	} 
    	}
    	 
    	return target; 
    };

	$('.product_attributes').on('click', 'button.thwvsf_add_new_attribute', function (event) {
		event.preventDefault();

		$('.thwvsf-class').val('');
		var placeholder = thwvsf_var.placeholder_image;
		$('.i_index_media_img').attr( 'src',placeholder);
		$('.thpladmin-colorpickpreview').css('background-color','');

		var popup_outer = $('.thwvsf-attribte-dialog');
		popup_outer.find("input[type=text]").val("");

		if(popup_outer.hasClass('thwvsf-attribte-dialog-image')){
			var remove_button = popup_outer.find('.thwvsf_remove_image_button');
			remove_button.hide();
		}

		var $wrapper  = $( this ).closest( '.woocommerce_attribute' ),
			attribute = $wrapper.data( 'taxonomy' ),
			taxonomy = $(this).data('attr_taxonomy'),
			type = ($(this).data('attr_type')),
			settings_div = $('.thwvsf_settings_fields_form');

		thwvsf_base.setupColorPicker(settings_div);
		var $popup_div = $('.thwvsf-attribte-dialog-'+type),
			height = type == 'color' ? 395 : 250;

		if($popup_div.length > 0){
			$popup_div.dialog({ 

		       'dialogClass'   	: 'wp-dialog thwvsf-popup',  
		       'title'         	: 'Add new term',         
		       'modal'         	: true,
		       'autoOpen'      	: false, 
		       'width'       	: 500, 
		       'minHeight'      : height,

		       'buttons': [{
	               text:'save',
	               "class":"button_class",
	               click: function() {
	               		save_new_term($wrapper, $(this), attribute);
	                	$(this).dialog('close');
	                }
	           }]
	 		});
			
			$( '.product_attributes' ).block({
				message: null,
				overlayCSS: {
					background: '#fff',
					opacity: 0.6
				}
			});
				
			$popup_div.dialog('open');
			$( '.product_attributes' ).unblock();	

			$('.ui-dialog.thwvsf-popup').css('z-index',99999999);
					
		}
	});

	function save_new_term($wrapper, $dialog, attribute){
		
		var new_attribute_name = '';
		var term_spec = {};

		new_attribute_name = $dialog.find('input[name = "attribute_name"]').val();
		term_spec['product_'+attribute] = $dialog.find('input[name = "attribute_type"]').val();
		
		
		if(new_attribute_name){
		    var ajax_data = _extends({
                action: 'woocommerce_add_new_attribute',
                taxonomy: attribute,
                term:new_attribute_name,
                security: woocommerce_admin_meta_boxes.add_attribute_nonce
            },term_spec);

			$.post(woocommerce_admin_meta_boxes.ajax_url, ajax_data, function (response) {
				
			
                if (response.error) {
                    window.alert(response.error);
                } else if (response.slug) {
                    $wrapper.find('select.attribute_values').append('<option value="' + response.term_id + '" selected="selected">' + response.name + '</option>');
                    $wrapper.find('select.attribute_values').change();
                }

                $('.product_attributes').unblock();
                    
			});
		} else {
			$( '.product_attributes' ).unblock();
		}
	}
           

});