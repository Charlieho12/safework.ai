import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Camera,
  FileText,
  ArrowRight,
  Clock,
  Building2
} from 'lucide-react';
import type { Lavoro, StatoLavoro } from '@/types';

export default function LavoriListPage() {
  const { t } = useTranslation();
  const { lavori, deleteLavoro } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statoFilter, setStatoFilter] = useState<StatoLavoro | 'all'>('all');
  const [lavoroToDelete, setLavoroToDelete] = useState<Lavoro | null>(null);

  const filteredLavori = useMemo(() => {
    return lavori
      .filter(lavoro => {
        const matchesSearch = 
          lavoro.nome_progetto.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lavoro.nome_azienda_cliente.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStato = statoFilter === 'all' || lavoro.stato === statoFilter;
        return matchesSearch && matchesStato;
      })
      .sort((a, b) => new Date(b.data_modifica).getTime() - new Date(a.data_modifica).getTime());
  }, [lavori, searchQuery, statoFilter]);

  const handleDelete = async () => {
    if (lavoroToDelete) {
      await deleteLavoro(lavoroToDelete.id);
      setLavoroToDelete(null);
    }
  };

  const getStatoBadge = (stato: StatoLavoro) => {
    switch (stato) {
      case 'in_corso':
        return <Badge variant="default" className="bg-blue-500">{t('jobs.status.inProgress')}</Badge>;
      case 'completato':
        return <Badge variant="default" className="bg-green-500">{t('jobs.status.completed')}</Badge>;
      case 'archiviato':
        return <Badge variant="secondary">{t('jobs.status.archived')}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('jobs.title')}</h1>
          <p className="text-slate-500 mt-1">
            {t('jobs.manageProjects')}
          </p>
        </div>
        <Link to="/lavori/nuovo">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            {t('jobs.newJob')}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder={t('jobs.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select 
              value={statoFilter} 
              onValueChange={(value) => setStatoFilter(value as StatoLavoro | 'all')}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder={t('jobs.status.title')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('jobs.allStatuses')}</SelectItem>
                <SelectItem value="in_corso">{t('jobs.status.inProgress')}</SelectItem>
                <SelectItem value="completato">{t('jobs.status.completed')}</SelectItem>
                <SelectItem value="archiviato">{t('jobs.status.archived')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lavori List */}
      <div className="space-y-4">
        {filteredLavori.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {t('jobs.noJobs')}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchQuery || statoFilter !== 'all' 
                  ? t('jobs.tryDifferentFilters')
                  : t('jobs.createFirstToStart')
                }
              </p>
              {!searchQuery && statoFilter === 'all' && (
                <Link to="/lavori/nuovo">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('jobs.createJob')}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredLavori.map((lavoro) => (
            <Card key={lavoro.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900 text-lg">
                        {lavoro.nome_progetto}
                      </h3>
                      {getStatoBadge(lavoro.stato)}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 mb-3">
                      <Building2 className="w-4 h-4" />
                      <span>{lavoro.nome_azienda_cliente}</span>
                    </div>
                    {lavoro.descrizione && (
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                        {lavoro.descrizione}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t('jobs.modifiedOn')} {formatDate(lavoro.data_modifica)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {lavoro.immagini_count || 0} {t('jobs.photos')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link to={`/lavori/${lavoro.id}/camera`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Camera className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('jobDetail.photoGallery')}</span>
                      </Button>
                    </Link>
                    <Link to={`/lavori/${lavoro.id}/report`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">Report</span>
                      </Button>
                    </Link>
                    <Link to={`/lavori/${lavoro.id}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/lavori/${lavoro.id}/modifica`}>
                            <Edit className="w-4 h-4 mr-2" />
                            {t('common.edit')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => setLavoroToDelete(lavoro)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!lavoroToDelete} onOpenChange={() => setLavoroToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('jobDetail.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('jobDetail.deleteJobConfirm', { name: lavoroToDelete?.nome_progetto })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
