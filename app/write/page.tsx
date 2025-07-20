import WriteForm from "./WriteForm"

export default function WritePage() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Xulosalaringizni biz bilan ulashing</h1>
        <p className="text-gray-600 text-sm sm:text-base px-4">O'z3 fikrlaringiz, tajribalaringiz va tushunchalaringiz haqida yozish uchun imkon
        </p>
      </div>

      <WriteForm />
    </div>
  )
}
