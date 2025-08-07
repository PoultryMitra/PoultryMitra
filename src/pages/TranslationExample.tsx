import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Users, TrendingUp, Activity } from 'lucide-react';

export default function TranslationExample() {
  const { t, toggleLanguage, language } = useTranslation();

  const sampleData = {
    totalBatches: 5,
    totalBirds: 4500,
    avgFCR: 1.65,
    mortality: 2.3
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Language Toggle */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('batchManagement')}</h1>
          <Button
            onClick={toggleLanguage}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            {language === 'hi' ? 'English' : 'हिंदी'}
          </Button>
        </div>

        {/* Language Status */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-blue-800 font-medium">{t('currentLanguage')}</p>
            <p className="text-blue-600 text-sm mt-1">
              {t('switchLanguage')} - Click the globe button to switch between Hindi and English
            </p>
          </CardContent>
        </Card>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('totalBatches')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{sampleData.totalBatches}</div>
              <p className="text-xs text-blue-600">{t('active')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('totalBirdsCount')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{sampleData.totalBirds.toLocaleString()}</div>
              <p className="text-xs text-green-600">{t('performance')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('avgFCR')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{sampleData.avgFCR}</div>
              <p className="text-xs text-orange-600">{t('performance')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {t('totalMortality')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{sampleData.mortality}%</div>
              <p className="text-xs text-red-600">{t('mortality')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>{t('overview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">{t('add')}</Button>
              <Button variant="outline">{t('edit')}</Button>
              <Button variant="outline">{t('save')}</Button>
              <Button variant="outline">{t('download')}</Button>
              <Button variant="outline">{t('refresh')}</Button>
            </div>
          </CardContent>
        </Card>

        {/* Sample Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('batchName')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('batchName')}
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={language === 'hi' ? "बैच का नाम दर्ज करें" : "Enter batch name"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('startDate')}
                </label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('totalBirds')}
                </label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('currentAge')} ({t('days')})
                </label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{t('save')}</Button>
              <Button type="button" variant="outline">{t('cancel')}</Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">Translation System Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-yellow-700 space-y-2 text-sm">
              <li>✅ <strong>Persistent Language Selection:</strong> Your language choice is saved in localStorage</li>
              <li>✅ <strong>Instant Switching:</strong> Toggle between Hindi and English with one click</li>
              <li>✅ <strong>Fallback Support:</strong> If a translation is missing, it falls back to English</li>
              <li>✅ <strong>Context-based:</strong> Works across all components that use the Translation Context</li>
              <li>✅ <strong>Professional Translations:</strong> High-quality Hindi translations for agricultural terms</li>
              <li>✅ <strong>Accessibility:</strong> Sets document language attribute for screen readers</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
