import React from "react";
import {
  type ActionMeta,
  type CSSObjectWithLabel,
  type MultiValue,
} from "react-select";
import CreatableSelect from "react-select/creatable";

import { useRouter } from "next/router";

import {
  META_ACTIONS,
  type OptionType,
  TAG_MENU_STYLES,
  THEME_FOREST,
  type TagDetail,
} from "~/features/tradeDetails";
import { useThemeObserver } from "~/hooks/useThemeObserver";
import { api } from "~/utils/api";

import { DeleteTagIcon } from "./DeleteTagIcon";

interface Props {
  value: TagDetail[] | undefined;
  options: TagDetail[] | undefined;
  tagType: "Setup" | "Mistake" | "Custom";
}

export const TagSelect = ({ value, options, tagType }: Props) => {
  const tagColors = {
    Setup: "#359c60",
    Mistake: "#FF5630",
    Custom: "#0c98d8",
  };
  const router = useRouter();
  const ctx = api.useContext();
  const currentTheme = useThemeObserver();

  const symbol = router.query.symbol as string;
  const date = router.query.date as string;

  const removeTag = api.tags.removeTag.useMutation({
    onSuccess: () => ctx.tags.invalidate(),
  });

  const addTagToTradeMutation = api.tags.addTagToTrade.useMutation({
    onSuccess: () => ctx.tags.invalidate(),
  });

  const mutation = api.tags.addTag.useMutation({
    onSuccess: () => ctx.tags.invalidate(),
    onError(error) {
      alert(error);
    },
  });

  const handleChange = (
    _newValue: MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>
  ) => {
    if (actionMeta.action === META_ACTIONS.REMOVE) {
      removeTag.mutate({ id: actionMeta.removedValue?.id });
    }
    if (actionMeta.action === META_ACTIONS.SELECT) {
      addTagToTradeMutation.mutate({ symbol, date, id: actionMeta.option!.id });
    }
    if (actionMeta.action === META_ACTIONS.CLEAR) {
      const tagArray = actionMeta.removedValues?.map((tag) => tag.id);
      removeTag.mutate({ tagArray });
    }
  };
  const handleCreate = (name: string, type: string) => {
    mutation.mutate({ name, type, symbol, date });
  };

  const customStyles = {
    control: (baseStyles: CSSObjectWithLabel) => ({
      ...baseStyles,
      backgroundColor: "transparent",
      borderColor: tagColors[tagType],
      color: TAG_MENU_STYLES.WHITE,
      ":hover": {
        borderColor: tagColors[tagType],
      },
    }),
    menu: (baseStyles: CSSObjectWithLabel) => ({
      ...baseStyles,
      backgroundColor:
        currentTheme === THEME_FOREST
          ? TAG_MENU_STYLES.DARK_MODE
          : TAG_MENU_STYLES.LIGHT_MODE,
      borderColor: TAG_MENU_STYLES.WHITE,
      borderWidth: 1,
    }),
    option: (baseStyles: CSSObjectWithLabel) => ({
      ...baseStyles,
      backgroundColor:
        currentTheme === THEME_FOREST
          ? "transparent"
          : TAG_MENU_STYLES.LIGHT_MODE,
      ":hover": {
        backgroundColor: currentTheme === THEME_FOREST ? "gray" : "#e2e0e0",
      },
    }),
    multiValue: (baseStyles: CSSObjectWithLabel) => ({
      ...baseStyles,
      backgroundColor: tagColors[tagType],
    }),
    multiValueLabel: (baseStyles: CSSObjectWithLabel) => ({
      ...baseStyles,
      color: TAG_MENU_STYLES.WHITE,
    }),
    input: (baseStyles: CSSObjectWithLabel) => ({
      ...baseStyles,
      color:
        currentTheme === THEME_FOREST
          ? TAG_MENU_STYLES.LIGHT_MODE
          : TAG_MENU_STYLES.DARK_MODE,
    }),
  };
  return (
    <CreatableSelect
      maxMenuHeight={225}
      value={value}
      instanceId={"Trade-Tag-Selector"}
      isMulti
      options={options}
      onChange={handleChange}
      onCreateOption={(value) => handleCreate(value, tagType)}
      styles={customStyles}
      components={{
        Option: DeleteTagIcon,
      }}
    />
  );
};
