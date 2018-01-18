'use strict';

$(document).ready(function () {
    $('.spy').addClass('invisible').viewportChecker({
        classToRemove: 'invisible',
        offset: 300,
        invertBottomOffset: false
    });

    changeBlocks();

    $("[data-click-image]").on("click", function (event) {
        var value = $(this).attr("data-click-image");
        var name = $(this).attr("data-click-image-name");

        var $input = $("input[id=" + value + "]")[0];

        $("[data-image-name=" + name + "]").hide();
        $("[data-image-value=" + value + "]").show();

        if ($input.checked) {
            event.preventDefault();
            $input.checked = false;
            $("[data-image-name=" + name + "]").hide();
        }
    });

    $("[data-click-block]").on("click", changeBlocks);
    $("[data-color]").on("click", changeBlocks);

    $("[data-click-item]").on("click", adult);

    function adult() {
        var name;

        $("[data-click-item]").each(function (i, elem) {
            if (elem.checked) {
                name = $(elem).attr("data-click-item");
                return;
            }
        });

        if (name === "Adult") {
            $(".blockIsShow [data-filter-item]").show();
        } else {
            $(".blockIsShow [data-filter-item]").each(function (i, elem) {
                if ($(elem).attr("data-filter-item") === name) {
                    $(elem).show();
                } else {
                    $(elem).hide();
                }
            });
        }
    }

    $(".overlay").on("click", function (event) {
        if ($(event.target).hasClass("overlay")) $(".overlay").css("display", "none");
    });

    $("[data-open]").on("click", function (e) {
        e.preventDefault;

        var name = $(this).attr("data-open");

        $("[data-popup=" + name + "]").css("display", "flex");

        return false;
    });

    function changeBlocks(event) {
        var level1, level2;

        $(".radio-forImage").each(function (i, elem) {
            elem.checked = false;
        });

        $("[data-filter-level1]").hide().removeClass("blockIsShow");
        $("[data-filter-level2]").hide().removeClass("blockIsShow");

        $("[data-click-block]").each(function (i, elem) {
            if (elem.checked && !level1) {
                level1 = $(elem).attr("data-click-block");
            } else if (elem.checked && !level2) {
                level2 = $(elem).attr("data-click-block");
                return;
            }
        });

        $("[data-filter-level1=" + level1 + "]").each(function (i, elem) {
            if ($(elem).attr("data-filter-level2")) {

                if ($(elem).attr("data-filter-level2") == level2) {
                    $(elem).show().addClass("blockIsShow");
                } else {
                    $(elem).hide().removeClass("blockIsShow");
                }
            } else {
                $(elem).show().addClass("blockIsShow");
            }
        });

        adult();

        draw();
    }

    function draw() {
        $("[data-image-name]").hide();

        var level1, level2, level3;

        $("[data-click-block]").each(function (i, elem) {
            if (elem.checked && !level1) {
                level1 = $(elem).attr("data-click-block");
            } else if (elem.checked && !level2) {
                level2 = $(elem).attr("data-click-block");
                return;
            }
        });
        $("[data-color]").each(function (i, elem) {
            if (elem.checked && !level3) {
                level3 = $(elem).attr("data-color");
                return;
            }
        });

        $("[data-image-value=" + level1 + level2 + level3 + "]").show();
    }
});