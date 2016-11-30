define(
  'ephox.alloy.spec.GroupButtonSpec',

  [
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.data.Fields',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.perhaps.Option'
  ],

  function (Highlighting, Fields, SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, ValueSchema, Arr, Merger, Option) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('action'),

      Fields.markers([ 'selectedClass', 'buttonClass' ]),

      Fields.members([ 'button' ]),
      FieldSchema.strict('buttons'),

      FieldSchema.strict('uid')
    ];

    // FIX: Update ARIA pressed value. May need to be part of highlight
    var make = function (spec) {
      // Not sure about where these getOrDie statements are
      var detail = SpecSchema.asStructOrDie('alloy.group-button', schema, spec, [ ]);

      var placeholders = {
        '<alloy.group-buttons>': UiSubstitutes.multiple(
          Arr.map(detail.buttons(), function (bSpec) {
            // TODO: A nice way of verifying that bSpec has a value property.
            return Merger.deepMerge(
              detail.members().button().munge(bSpec),
              {
                uiType: 'button',
                toggling: {
                  toggleClass: detail.markers().selectedClass(),
                  toggleOnExecute: false
                },
                action: function (button) {
                  button.getSystem().getByUid(detail.uid()).each(function (group) {
                    Highlighting.highlight(group, button);
                  });
                  detail.action()(bSpec.value);
                }
              }
            );
          })
        )
      };

      var components = UiSubstitutes.substitutePlaces(
        Option.some('groupbutton'),
        detail,
        detail.components(),
        placeholders,
        { }
      );

      return Merger.deepMerge(spec, {
        type: 'custom',
        dom: detail.dom(),
        components: components,
        highlighting: {
          highlightClass: detail.markers().selectedClass(),
          itemClass: detail.markers().buttonClass()
        }
      });
    };

    return {
      make: make
    };
  }
);