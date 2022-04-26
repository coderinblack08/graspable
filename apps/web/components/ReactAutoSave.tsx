import { memo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import useDeepCompareEffect from "use-deep-compare-effect";

const AutoSave = memo(({ defaultValues, onSubmit }: Props) => {
  const methods = useFormContext();
  const debouncedSave = useDebouncedCallback(() => {
    methods.handleSubmit(onSubmit)();
  }, 1000);

  const watchedData = useWatch({
    control: methods.control,
    defaultValue: defaultValues || {},
  });

  useDeepCompareEffect(() => {
    if (methods.formState.isDirty) {
      debouncedSave();
    }
  }, [watchedData]);

  return null;
});

AutoSave.displayName = "AutoSave";

type Props = {
  defaultValues?: any;
  onSubmit: any;
};

export default AutoSave;
